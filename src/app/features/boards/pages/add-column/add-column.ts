import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../../../app-state';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../../ui/modal/modal';
import { Button } from '../../../../ui/button/button';

@Component({
  selector: 'app-add-column',
  imports: [CommonModule, ReactiveFormsModule, Modal, Button],
  templateUrl: './add-column.html',
  styleUrl: './add-column.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddColumnPage {
  private readonly router = inject(Router);
  protected readonly appState = inject(AppState);
  protected readonly isOpen = signal(true);

  protected readonly form = inject(FormBuilder).group({
    name: ['', [Validators.required]]
  })
  
  protected onClose(): void {
    this.isOpen.set(false);
    this.router.navigate(['/boards', this.appState.currentBoard()!.id]);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.value.name;
    if (!name) return;

    this.appState.addColumn(name);
    this.onClose();
  }
}
