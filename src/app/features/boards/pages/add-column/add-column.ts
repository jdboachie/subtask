import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BoardActions, BoardSelectors } from '../../../../store';
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
  private readonly store = inject(Store);
  protected readonly isOpen = signal(true);

  protected readonly form = inject(FormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
  });

  protected onClose(): void {
    this.isOpen.set(false);
    this.store.select(BoardSelectors.selectCurrentBoard).subscribe((board) => {
      if (board) {
        this.router.navigate(['/boards', board.id]);
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.value.name;
    if (!name) return;

    this.store.dispatch(BoardActions.addColumn({ name }));
    this.onClose();
  }
}
