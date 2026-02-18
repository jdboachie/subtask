import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from '../../../../app-state';
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
  protected readonly appState = inject(AppState);
  private readonly fb = inject(FormBuilder);
  protected readonly isOpen = signal(true);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(60)]],
    description: [''],
    status: [''],
    subtasks: this.fb.array([this.fb.control('', Validators.required)]),
  });

  protected readonly columns = computed(() => {
    const board = this.appState.currentBoard();
    return board?.columns ?? [];
  });

  constructor() {
    effect(() => {
      const cols = this.columns();

      const taskId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
      if (taskId) {
        const task = this.appState.getTaskById(taskId);
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
    this.router.navigate([
      '/boards',
      this.appState.currentBoard()!.id,
      'task',
      this.route.parent?.snapshot.paramMap.get('id'),
    ]);
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

    const taskId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
    if (taskId) {
      this.appState.updateTask(taskId, status, title, description, subtasks);
    } else {
      this.appState.addTask(status, title, description, subtasks);
    }

    this.onClose();
  }
}
