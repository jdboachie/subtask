import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Modal } from '../../../../ui/modal/modal';
import { Button } from '../../../../ui/button/button';

@Component({
  selector: 'app-edit-task',
  imports: [CommonModule, ReactiveFormsModule, Modal, Button],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTaskPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
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

      const taskId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
      if (taskId) {
        const task = this.store.selectSignal(BoardSelectors.selectTaskById(taskId))();
        if (task) {
          this.form.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
          });

          this.subtasks.clear();
          for (const st of task.subtasks) {
            this.subtasks.push(this.fb.control(st.title, Validators.required));
          }
        }
      }

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
      this.router.navigate([
        '/boards',
        currentBoard.id,
        'task',
        this.route.parent?.snapshot.paramMap.get('id'),
      ]);
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
    const titles = (this.form.value.subtasks as string[]).map((t) => t.trim());

    const taskId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
    const existingTask = taskId
      ? this.store.selectSignal(BoardSelectors.selectTaskById(taskId))()
      : null;
    const existingSubtasks = existingTask?.subtasks ?? [];

    const subtasks = titles.map((t, i) => ({
      title: t,
      isCompleted: existingSubtasks[i]?.isCompleted ?? false,
    }));

    if (taskId) {
      this.store.dispatch(
        BoardActions.updateTask({ taskId, status, title, description, subtasks }),
      );
    } else {
      this.store.dispatch(BoardActions.addTask({ status, title, description, subtasks }));
    }

    this.onClose();
  }
}
