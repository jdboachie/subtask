import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { Board, BoardData } from '../ui/board/board.model';

const API_BASE_URL = '/api';
const MOCK_DATA_URL = '/data.json';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly http = inject(HttpClient);

  private readonly boards$ = this.http
    .get<BoardData>(MOCK_DATA_URL)
    .pipe(shareReplay(1), catchError(this.handleError));

  getAllBoards(): Observable<BoardData> {
    return this.boards$;
  }

  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${API_BASE_URL}/boards/${id}`).pipe(catchError(this.handleError));
  }

  createBoard(board: Omit<Board, 'id'>): Observable<Board> {
    return this.http
      .post<Board>(`${API_BASE_URL}/boards`, board)
      .pipe(catchError(this.handleError));
  }

  updateBoard(id: string, board: Partial<Board>): Observable<Board> {
    return this.http
      .put<Board>(`${API_BASE_URL}/boards/${id}`, board)
      .pipe(catchError(this.handleError));
  }

  deleteBoard(id: string): Observable<void> {
    return this.http
      .delete<void>(`${API_BASE_URL}/boards/${id}`)
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
