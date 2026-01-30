import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Task } from '../../board.model';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.html',
  styleUrl: './task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly task = input.required<Task>();

  protected readonly completedCount = computed(
    () => this.task().subtasks.filter((s) => s.isCompleted).length,
  );

  protected readonly totalCount = computed(() => this.task().subtasks.length);
}
