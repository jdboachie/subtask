import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpButton } from 'ng-primitives/button';
import { Router } from '@angular/router';
import { AppState } from '../../app-state';

@Component({
  selector: 'app-board-options',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  templateUrl: './board-options.html',
  styleUrl: './board-options.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardOptions {
  private readonly router = inject(Router);
  private readonly appState = inject(AppState);

  protected onEditBoard(): void {
    this.router.navigate(['/boards', this.appState.currentBoard()!.id, 'edit']);
  }

  protected onDeleteBoard(): void {
    this.router.navigate(['/boards', this.appState.currentBoard()!.id, 'delete']);
  }
}
