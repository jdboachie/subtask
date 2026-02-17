import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../board.model';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.html',
  styleUrl: './task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'onTaskClick()',
  },
})
export class TaskCard {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly task = input.required<Task>();

  protected readonly completedCount = computed(
    () => this.task().subtasks.filter((s) => s.isCompleted).length,
  );

  protected readonly totalCount = computed(() => this.task().subtasks.length);

  protected onTaskClick(): void {
    const task = this.task();
    this.router.navigate(['task', task.id], { relativeTo: this.route });
  }
}
