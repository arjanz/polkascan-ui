import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NetworkService } from '../../../../../services/network.service';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Block } from '../../../../../services/block/block.harvester';
import { distinctUntilChanged, filter, first, map, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { PolkadaptService } from '../../../../../services/polkadapt.service';
import * as pst from '@polkadapt/polkascan/lib/polkascan.types';

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockDetailComponent implements OnInit, OnDestroy {
  private destroyer: Subject<undefined> = new Subject();
  block = new BehaviorSubject<Block | null>(null);
  extrinsics = new BehaviorSubject<pst.Extrinsic[]>([]);
  events = new BehaviorSubject<pst.Event[]>([]);
  headNumber = new BehaviorSubject<number>(0);

  constructor(
    private route: ActivatedRoute,
    private ns: NetworkService,
    private pa: PolkadaptService,
  ) { }

  ngOnInit(): void {
    const blockNr: number = parseInt(this.route.snapshot.params.id, 10);
    // Wait for network to be set.
    this.ns.currentNetwork.pipe(
      takeUntil(this.destroyer),
      // Only continue if a network is set.
      filter(network => !!network),
      // We don't have to wait for further changes to network.
      first(),
      switchMap(() => combineLatest(
        // Update block when block data changes.
        this.ns.blockHarvester.blocks[blockNr].pipe(
          tap(block => {
            this.block.next(block);
            if (block.finalized) {
              this.pa.run().polkascan.getExtrinsics({blockNumber: blockNr})
                .then((result: pst.ListResponse<pst.Extrinsic>) => {
                  this.extrinsics.next(result.objects);
                });
              this.pa.run().polkascan.getEvents({blockNumber: blockNr})
                .then((result: pst.ListResponse<pst.Event>) => {
                  this.events.next(result.objects);
                });
            }
          })
        ),
        // Update this component's headNumber when blockHarvester's headNumber changes.
        this.ns.blockHarvester.headNumber.pipe(
          filter(nr => nr > 0),
          tap(nr => {
            this.headNumber.next(nr);
          })
        )
      ).pipe(
        takeUntil(this.destroyer),
        // Stop watching when this block is finalized.
        takeWhile(result => !result[0].finalized),
      ))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroyer.next();
    this.destroyer.complete();
  }
}
