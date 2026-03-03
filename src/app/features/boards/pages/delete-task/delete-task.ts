import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
import { Button } from '../../../../ui/button/button';
import { Modal } from '../../../../ui/modal/modal';
import { TaskService } from '../../../../services/task.service';

@Component({
  selector: 'app-delete-task',
  imports: [CommonModule, Modal, Button],
  templateUrl: './delete-task.html',
  styleUrl: './delete-task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteTaskModal {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly taskService = inject(TaskService);
  protected readonly isOpen = signal(true);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected deleteTask(): void {
    const taskId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
    const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (!taskId || !currentBoard) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    this.taskService.deleteTask(currentBoard.id, taskId).subscribe({
      complete: () => {
        this.deleting.set(false);
        this.store.dispatch(BoardActions.deleteTask({ taskId }));
        this.isOpen.set(false);
        this.router.navigate(['/boards', currentBoard.id]);
      },
      error: (err: Error) => {
        this.deleting.set(false);
        this.deleteError.set(err.message);
        this.store.dispatch(BoardActions.deleteTask({ taskId }));
        this.isOpen.set(false);
        this.router.navigate(['/boards', currentBoard.id]);
      },
    });
  }

  protected onClose(): void {
    this.isOpen.set(false);
    const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (currentBoard) {
      this.router.navigate(['/boards', currentBoard.id]);
    }
  }
}
