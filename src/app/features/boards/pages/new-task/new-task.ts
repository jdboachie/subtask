import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Modal } from '../../../../ui/modal/modal';
import { Button } from '../../../../ui/button/button';

@Component({
  selector: 'app-new-task',
  imports: [CommonModule, ReactiveFormsModule, Modal, Button],
  templateUrl: './new-task.html',
  styleUrl: './new-task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTaskPage {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  protected readonly isOpen = signal(true);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(60)]],
    description: [''],
    status: [''],
    subtasks: this.fb.array([this.fb.control('', Validators.required)]),
  });

  protected readonly columns = toSignal(this.store.select(BoardSelectors.selectColumns), {
    initialValue: [],
  });

  constructor() {
    effect(() => {
      const cols = this.columns();
      if (cols.length > 0 && !this.form.value.status) {
        this.form.patchValue({ status: cols[0].name });
      }
    });
  }

  protected get subtasks(): FormArray {
    return this.form.get('subtasks') as FormArray;
  }

  protected addNewSubTask(): void {
    this.subtasks.push(this.fb.control('', Validators.required));
  }

  protected removeSubTask(index: number): void {
    if (this.subtasks.length > 1) {
      this.subtasks.removeAt(index);
    }
  }

  protected onClose(): void {
    this.isOpen.set(false);
    const currentBoard = this.store.selectSignal(BoardSelectors.selectCurrentBoard)();
    if (currentBoard) {
      this.router.navigate(['/boards', currentBoard.id]);
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const title = (this.form.value.title ?? '').trim();

    const description = (this.form.value.description ?? '').trim();
    const status = this.form.value.status ?? '';
    const subtasks = (this.form.value.subtasks as string[]).map((t) => ({
      title: t.trim(),
      isCompleted: false,
    }));

    this.store.dispatch(BoardActions.addTask({ status, title, description, subtasks }));
    this.onClose();
  }
}
