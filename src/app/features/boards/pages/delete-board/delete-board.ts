import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
import { CommonModule } from '@angular/common';
import { Modal } from '../../../../ui/modal/modal';
import { Button } from '../../../../ui/button/button';
import { BoardService } from '../../../../services/board.service';

@Component({
  selector: 'app-delete-board',
  imports: [CommonModule, Modal, Button],
  templateUrl: './delete-board.html',
  styleUrl: './delete-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteBoardModal {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly boardService = inject(BoardService);
  protected readonly isOpen = signal(true);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected onClose(): void {
    this.isOpen.set(false);
    this.router.navigateByUrl('/boards');
  }

  protected onDelete(): void {
    const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (!currentBoard) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    this.boardService.deleteBoard(currentBoard.id).subscribe({
      complete: () => {
        this.deleting.set(false);
        this.store.dispatch(BoardActions.deleteBoard({ boardId: currentBoard.id }));
        this.isOpen.set(false);
        this.router.navigateByUrl('/boards');
      },
      error: (err: Error) => {
        this.deleting.set(false);
        this.deleteError.set(err.message);
        this.store.dispatch(BoardActions.deleteBoard({ boardId: currentBoard.id }));
        this.isOpen.set(false);
        this.router.navigateByUrl('/boards');
      },
    });
  }
}
