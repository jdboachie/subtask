import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { guestGuard } from './guest';
import { AuthSelectors } from '../../store';

describe('guestGuard', () => {
  let store: MockStore;
  let router: { createUrlTree: jest.Mock };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;
  const mockUrlTree = { toString: () => '/boards' } as unknown as UrlTree;

  beforeEach(() => {
    router = { createUrlTree: jest.fn().mockReturnValue(mockUrlTree) };

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: Router, useValue: router },
      ],
    });

    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
    jest.clearAllMocks();
  });

  it('returns a UrlTree pointing to /boards when user is authenticated', () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, true);
    store.refreshState();

    TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/boards']);
  });

  it('returns the UrlTree from router.createUrlTree when authenticated', () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, true);
    store.refreshState();

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(result).toBe(mockUrlTree);
  });

  it('returns true when user is not authenticated', () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, false);
    store.refreshState();

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('does not call router.createUrlTree when not authenticated', () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, false);
    store.refreshState();

    TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
