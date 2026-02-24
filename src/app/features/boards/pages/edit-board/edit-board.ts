import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
import { CommonModule } from '@angular/common';
import { Button } from '../../../../ui/button/button';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Modal } from '../../../../ui/modal/modal';

@Component({
  selector: 'app-edit-board',
  imports: [CommonModule, ReactiveFormsModule, Button, Modal],
  templateUrl: './edit-board.html',
  styleUrl: './edit-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditBoardPage {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  protected readonly isOpen = signal(true);

  protected onClose(): void {
    this.isOpen.set(false);
    const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (currentBoard) {
      this.router.navigate(['/boards', currentBoard.id]);
    }
  }

  protected readonly form = this.fb.group({
    name: [
      this.store.selectSignal(BoardSelectors.selectCurrentBoard)()?.name ?? '',
      [Validators.required, Validators.maxLength(60)],
    ],
    columns: this.fb.array(
      this.store
        .selectSignal(BoardSelectors.selectCurrentBoard)()
        ?.columns.map((column) => column.name) ?? [],
    ),
  });

  protected get columns(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  protected addColumn(): void {
    this.columns.push(this.fb.control('', Validators.required));
  }

  protected removeColumn(index: number): void {
    if (this.columns.length > 1) {
      this.columns.removeAt(index);
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (!currentBoard) return;

    const name = (this.form.value.name ?? '').trim();
    const columnNames: string[] = (this.form.value.columns as string[])
      .map((c) => c.trim())
      .filter(Boolean);

    const boards = this.store.selectSignal(BoardSelectors.selectAllBoards)();
    const exists = boards.some(
      (b) => b.id !== currentBoard.id && b.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      this.form.get('name')?.setErrors({ duplicate: true });
      return;
    }

    this.store.dispatch(BoardActions.updateBoard({ boardId: currentBoard.id, name, columnNames }));

    window.dispatchEvent(new CustomEvent('close:edit-board'));

    await this.router.navigate(['/boards', currentBoard.id]);
  }
}
