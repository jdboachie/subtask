import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Column, Task } from '../board.model';
import { TaskCard } from './task/task';

export interface ColumnDropEvent {
  sourceColumnIndex: number;
  targetColumnIndex: number;
  sourceTaskIndex: number;
  targetTaskIndex: number;
}

@Component({
  selector: 'app-column',
  imports: [CdkDropList, CdkDrag, TaskCard],
  templateUrl: './column.html',
  styleUrl: './column.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnView {
  readonly column = input.required<Column>();
  readonly columnIndex = input.required<number>();

  readonly taskDrop = output<ColumnDropEvent>();

  protected readonly taskCount = computed(() => this.column().tasks.length);

  protected onDrop(event: CdkDragDrop<{ tasks: readonly Task[]; columnIndex: number }>): void {
    this.taskDrop.emit({
      sourceColumnIndex: event.previousContainer.data.columnIndex,
      targetColumnIndex: event.container.data.columnIndex,
      sourceTaskIndex: event.previousIndex,
      targetTaskIndex: event.currentIndex,
    });
  }
}
