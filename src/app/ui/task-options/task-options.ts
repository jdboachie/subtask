import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpButton } from 'ng-primitives/button';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-options',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  templateUrl: './task-options.html',
  styleUrl: './task-options.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskOptions {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected onEditTask(): void {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  protected onDeleteTask(): void {
    this.router.navigate(['delete'], { relativeTo: this.route });
  }
}
