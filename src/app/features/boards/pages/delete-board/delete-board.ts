import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../../../app-state';
import { CommonModule } from '@angular/common';
import { Modal } from '../../../../ui/modal/modal';
import { Button } from '../../../../ui/button/button';

@Component({
  selector: 'app-delete-board',
  imports: [CommonModule, Modal, Button],
  templateUrl: './delete-board.html',
  styleUrl: './delete-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteBoardModal {
  private readonly router = inject(Router);
  protected readonly appState = inject(AppState);
  protected readonly isOpen = signal(true);

  protected onClose(): void {
    this.isOpen.set(false);
    this.router.navigateByUrl('/boards');
  }

  protected onDelete(): void {
    const currentBoard = this.appState.currentBoard();
    if (currentBoard) {
      this.appState.deleteBoard(currentBoard.id);
      this.isOpen.set(false);
      this.router.navigateByUrl('/boards');
    }
  }
}
