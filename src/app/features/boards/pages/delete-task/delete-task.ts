import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
import { Button } from '../../../../ui/button/button';
import { Modal } from '../../../../ui/modal/modal';

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
  protected readonly isOpen = signal(true);

  protected deleteTask(): void {
    const taskId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
    if (taskId) {
      this.store.dispatch(BoardActions.deleteTask({ taskId }));
      this.isOpen.set(false);
      const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
      if (currentBoard) {
        this.router.navigate(['/boards', currentBoard.id]);
      }
    }
  }

  protected onClose(): void {
    this.isOpen.set(false);
    const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (currentBoard) {
      this.router.navigate(['/boards', currentBoard.id]);
    }
  }
}
