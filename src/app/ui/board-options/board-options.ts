import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpButton } from 'ng-primitives/button';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardSelectors } from '../../store';

@Component({
  selector: 'app-board-options',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  templateUrl: './board-options.html',
  styleUrl: './board-options.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardOptions {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  readonly disabled = input(false);

  protected onEditBoard(): void {
    const board = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (!board) return;
    this.router.navigate(['/boards', board.id, 'edit']);
  }

  protected onDeleteBoard(): void {
    const board = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (!board) return;
    this.router.navigate(['/boards', board.id, 'delete']);
  }
}
