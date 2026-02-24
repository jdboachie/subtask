import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Board, Task, Subtask } from '../../ui/board/board.model';
import { MoveTaskEvent } from '../../app-state.model';

export const BoardActions = createActionGroup({
  source: 'Boards',
  events: {
    'Load Boards': emptyProps(),
    'Load Boards Success': props<{ boards: readonly Board[] }>(),
    'Load Boards Failure': props<{ error: string }>(),

    'Select Board': props<{ index: number }>(),
    'Select Board By Id': props<{ id: string }>(),
    'Select Board By Name': props<{ name: string }>(),

    'Create Board': props<{ name: string; columnNames: string[] }>(),
    'Create Board Success': props<{ board: Board }>(),

    'Update Board': props<{ boardId: string; name: string; columnNames: string[] }>(),
    'Update Board Success': props<{ board: Board }>(),

    'Delete Board': props<{ boardId: string }>(),
    'Delete Board Success': props<{ boardId: string }>(),

    'Add Column': props<{ name: string }>(),

    'Move Task': props<MoveTaskEvent>(),

    'Add Task': props<{
      status: string;
      title: string;
      description: string;
      subtasks: readonly Subtask[];
    }>(),

    'Update Task': props<{
      taskId: string;
      status: string;
      title: string;
      description: string;
      subtasks: readonly Subtask[];
    }>(),

    'Delete Task': props<{ taskId: string }>(),

    'Set Boards Override': props<{ boards: Board[] | null }>(),
  },
});
