import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BoardService } from './board.service';
import { Board, BoardData } from '../ui/board/board.model';

describe('BoardService', () => {
  let service: BoardService;
  let httpMock: HttpTestingController;

  const mockBoards: Board[] = [
    { id: '1', name: 'Platform Launch', columns: [] },
    { id: '2', name: 'Marketing Plan', columns: [] },
  ];

  const mockBoardData: BoardData = { boards: mockBoards };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BoardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAllBoards', () => {
    it('returns board data from /data.json', () => {
      let result: BoardData | undefined;

      service.getAllBoards().subscribe((data) => (result = data));

      const req = httpMock.expectOne('/data.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockBoardData);

      expect(result).toEqual(mockBoardData);
    });

    it('replays cached response to multiple subscribers without making extra requests', () => {
      const results: BoardData[] = [];

      service.getAllBoards().subscribe((d) => results.push(d));
      service.getAllBoards().subscribe((d) => results.push(d));

      const req = httpMock.expectOne('/data.json');
      req.flush(mockBoardData);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(mockBoardData);
      expect(results[1]).toEqual(mockBoardData);
    });

    it('propagates network errors', () => {
      let errorMessage: string | undefined;

      service.getAllBoards().subscribe({ error: (err: Error) => (errorMessage = err.message) });

      const req = httpMock.expectOne('/data.json');
      req.error(new ProgressEvent('error'));

      expect(errorMessage).toContain('network error');
    });
  });

  describe('createBoard', () => {
    it('sends POST to /api/boards', () => {
      const newBoard: Omit<Board, 'id'> = { name: 'New Board', columns: [] };
      let result: Board | undefined;

      service.createBoard(newBoard).subscribe((b) => (result = b));

      const req = httpMock.expectOne('/api/boards');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newBoard);
      req.flush({ ...newBoard, id: '99' });

      expect(result?.id).toBe('99');
    });
  });

  describe('updateBoard', () => {
    it('sends PUT to /api/boards/:id', () => {
      const update: Partial<Board> = { name: 'Renamed' };
      let result: Board | undefined;

      service.updateBoard('1', update).subscribe((b) => (result = b));

      const req = httpMock.expectOne('/api/boards/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockBoards[0], name: 'Renamed' });

      expect(result?.name).toBe('Renamed');
    });
  });

  describe('deleteBoard', () => {
    it('sends DELETE to /api/boards/:id', () => {
      let completed = false;

      service.deleteBoard('1').subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne('/api/boards/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(completed).toBe(true);
    });
  });
});
