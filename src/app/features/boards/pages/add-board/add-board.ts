import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../../../app-state';
import { CommonModule } from '@angular/common';
import { Button } from '../../../../ui/button/button';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-add-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button],
  templateUrl: './add-board.html',
  styleUrl: './add-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBoardPage {
  private readonly router = inject(Router);
  protected readonly appState = inject(AppState);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    columns: this.fb.array([this.fb.control('', Validators.required)]),
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

    const name = (this.form.value.name ?? '').trim();
    const columnNames: string[] = (this.form.value.columns as string[]).map((c) => c.trim()).filter(Boolean);

    const exists = this.appState.boards().some((b) => b.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.form.get('name')?.setErrors({ duplicate: true });
      return;
    }

    const board = this.appState.createBoard(name, columnNames);

    window.dispatchEvent(new CustomEvent('close:add-board'));

    await this.router.navigate(['/boards', board.id]);
  }
}
