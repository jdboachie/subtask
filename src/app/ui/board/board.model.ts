export interface Subtask {
  readonly title: string;
  readonly isCompleted: boolean;
}

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly subtasks: readonly Subtask[];
}

export interface Column {
  readonly name: string;
  tasks: Task[];
}

export interface Board {
  readonly id: string;
  readonly name: string;
  columns: Column[];
}

export interface BoardData {
  readonly boards: readonly Board[];
}
