import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Board } from '../../board/board.model';
import { SidebarButton } from '../sidebar-button/sidebar-button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-boards-menu',
  templateUrl: './boards-menu.html',
  styleUrl: './boards-menu.css',
  imports: [SidebarButton, RouterLinkActive, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsMenu {
  readonly boards = input<readonly Board[]>([]);

  readonly createBoard = output<void>();
  readonly selectBoard = output<string>();

  protected onSelectBoard(id: string): void {
    this.selectBoard.emit(id);
  }

  protected onCreateBoard(): void {
    this.createBoard.emit();
  }
}
