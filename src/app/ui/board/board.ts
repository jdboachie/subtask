import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Board } from './board.model';
import { Button } from '../button/button';
import { ColumnDropEvent, ColumnView } from './column/column';
import { Router } from '@angular/router';
import { BoardActions, BoardSelectors } from '../../store';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, ColumnView, Button],
  templateUrl: './board.html',
  styleUrl: './board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardView {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly currentBoard = input<Board | null>(null);

  readonly taskMoved = output<void>();

  protected onTaskDrop(event: ColumnDropEvent): void {
    this.store.dispatch(BoardActions.moveTask(event));
    this.taskMoved.emit();
  }

  protected onAddColumn(): void {
    const board =
      this.currentBoard() ?? this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (board) {
      this.router.navigate(['/boards/', board.id, 'new-column']);
    }
  }
}
