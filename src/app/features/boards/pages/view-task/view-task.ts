import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  effect,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../ui/modal/modal';
import { TaskOptions } from '../../../../ui/task-options/task-options';
import { BoardSelectors, BoardActions } from '../../../../store';
import type { Task, Subtask } from '../../../../ui/board/board.model';

@Component({
  selector: 'app-view-task',
  imports: [CommonModule, ReactiveFormsModule, Modal, TaskOptions, RouterOutlet],
  templateUrl: './view-task.html',
  styleUrl: './view-task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewTaskPage {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly isOpen = signal(true);

  readonly id = input.required<string>();

  protected readonly task = signal<Task | null>(null);

  protected readonly completedCount = computed(
    () => this.task()?.subtasks.filter((s) => s.isCompleted).length ?? 0,
  );

  protected readonly totalCount = computed(() => this.task()?.subtasks.length ?? 0);

  protected readonly columns = computed(() => {
    const board = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    return board?.columns ?? [];
  });

  constructor() {
    effect(() => {
      const taskId = this.id();
      if (!taskId) {
        this.task.set(null);
        return;
      }
      const sel = BoardSelectors.selectTaskById(taskId);
      const t = this.store.selectSignal(sel)();
      this.task.set(t);
    });
  }

  protected toggleSubtask(index: number): void {
    const t = this.task();
    if (!t) return;
    const newSubtasks: Subtask[] = t.subtasks.map((s, i) =>
      i === index ? { ...s, isCompleted: !s.isCompleted } : s,
    );
    this.store.dispatch(
      BoardActions.updateTask({
        taskId: this.id(),
        status: t.status,
        title: t.title,
        description: t.description,
        subtasks: newSubtasks,
      }),
    );
  }

  protected changeStatus(newStatus: string): void {
    const t = this.task();
    if (!t) return;
    this.store.dispatch(
      BoardActions.updateTask({
        taskId: this.id(),
        status: newStatus,
        title: t.title,
        description: t.description,
        subtasks: t.subtasks,
      }),
    );
  }

  protected onClose(): void {
    this.isOpen.set(false);
    const board = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (board) {
      this.router.navigate(['/boards', board.id]);
    } else {
      this.router.navigate(['/boards']);
    }
  }
}
