import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Task } from '../ui/board/board.model';

const API_BASE_URL = '/api';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);

  getTaskById(boardId: string, taskId: string): Observable<Task> {
    return this.http
      .get<Task>(`${API_BASE_URL}/boards/${boardId}/tasks/${taskId}`)
      .pipe(catchError(this.handleError));
  }

  createTask(boardId: string, task: Omit<Task, 'id'>): Observable<Task> {
    return this.http
      .post<Task>(`${API_BASE_URL}/boards/${boardId}/tasks`, task)
      .pipe(catchError(this.handleError));
  }

  updateTask(boardId: string, taskId: string, task: Partial<Task>): Observable<Task> {
    return this.http
      .put<Task>(`${API_BASE_URL}/boards/${boardId}/tasks/${taskId}`, task)
      .pipe(catchError(this.handleError));
  }

  deleteTask(boardId: string, taskId: string): Observable<void> {
    return this.http
      .delete<void>(`${API_BASE_URL}/boards/${boardId}/tasks/${taskId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.status === 0
        ? 'A network error occurred. Please check your connection.'
        : `Server returned code ${error.status}: ${error.message}`;
    return throwError(() => new Error(message));
  }
}
