import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { AppState } from '../../app-state';
import { Board } from './board.model';
import { Button } from '../button/button';
import { ColumnDropEvent, ColumnView } from './column/column';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, ColumnView, Button],
  templateUrl: './board.html',
  styleUrl: './board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardView {
  private readonly appState = inject(AppState);
  private readonly router = inject(Router);

  readonly currentBoard = input<Board | null>(null);

  readonly taskMoved = output<void>();

  protected onTaskDrop(event: ColumnDropEvent): void {
    this.appState.moveTask(event);
    this.taskMoved.emit();
  }

  protected onAddColumn(): void {
    this.router.navigate(['/boards/', this.appState.currentBoard()!.id, 'new-column']);
  }
}
