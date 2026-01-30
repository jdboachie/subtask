export interface Subtask {
  readonly title: string;
  readonly isCompleted: boolean;
}

export interface Task {
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly subtasks: readonly Subtask[];
}

export interface Column {
  readonly name: string;
  readonly tasks: readonly Task[];
}

export interface Board {
  readonly name: string;
  readonly columns: readonly Column[];
}

export interface BoardData {
  readonly boards: readonly Board[];
}
