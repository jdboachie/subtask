import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppState } from '../../../../app-state';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../ui/modal/modal';
import { TaskOptions } from '../../../../ui/task-options/task-options';

@Component({
  selector: 'app-view-task',
  imports: [CommonModule, ReactiveFormsModule, Modal, TaskOptions, RouterOutlet],
  templateUrl: './view-task.html',
  styleUrl: './view-task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewTaskPage {
  private readonly router = inject(Router);
  protected readonly appState = inject(AppState);
  protected readonly isOpen = signal(true);

  readonly id = input.required<string>();

  protected readonly task = computed(() => this.appState.getTaskById(this.id()));

  protected readonly completedCount = computed(
    () => this.task()?.subtasks.filter((s) => s.isCompleted).length ?? 0,
  );

  protected readonly totalCount = computed(() => this.task()?.subtasks.length ?? 0);

  protected readonly columns = computed(() => this.appState.currentBoard()?.columns ?? []);

  protected toggleSubtask(index: number): void {
    const t = this.task();
    if (!t) return;
    const newSubtasks = t.subtasks.map((s, i) =>
      i === index ? { ...s, isCompleted: !s.isCompleted } : s,
    );
    this.appState.updateTask(this.id(), t.status, t.title, t.description, newSubtasks);
  }

  protected changeStatus(newStatus: string): void {
    const t = this.task();
    if (!t) return;
    this.appState.updateTask(this.id(), newStatus, t.title, t.description, t.subtasks);
  }

  protected onClose(): void {
    this.isOpen.set(false);
    this.router.navigate(['/boards', this.appState.currentBoard()!.id]);
  }
}
