/*
 * Polkascan Explorer UI
 * Copyright (C) 2018-2021 Polkascan Foundation (NL)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'attribute-block',
  template: `
    <ng-container *ngIf="attribute">
      <a [routerLink]="'/block/' + attribute.value" [relativeTo]="relativeToRoute">
        Block {{ attribute.value }}}}
      </a>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeBlockComponent implements OnInit {
  @Input() attribute: { type: string, value: number };

  relativeToRoute: ActivatedRoute | undefined;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const network = this.route.snapshot.paramMap && this.route.snapshot.paramMap.get('network');
    if (network) {
      this.relativeToRoute = this.route.pathFromRoot.find(routePart => routePart.snapshot.url[0]?.path === network);
    }
  }
}
