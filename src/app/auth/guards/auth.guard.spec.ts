import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom } from 'rxjs';
import { authGuard } from './auth';
import { AuthSelectors, AuthActions } from '../../store';

describe('authGuard', () => {
  let store: MockStore;
  let router: { navigate: jest.Mock; createUrlTree: jest.Mock };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    router = {
      navigate: jest.fn().mockResolvedValue(true),
      createUrlTree: jest.fn((commands: string[]) => commands as unknown as UrlTree),
    };

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

  it('returns true when user is authenticated', async () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, true);
    store.refreshState();

    const result = await TestBed.runInInjectionContext(() => {
      const guard = authGuard(mockRoute, mockState);
      return firstValueFrom(guard as Observable<boolean | UrlTree>);
    });

    expect(result).toBe(true);
  });

  it('returns a UrlTree pointing to /login when user is not authenticated', async () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, false);
    store.refreshState();

    await TestBed.runInInjectionContext(() => {
      const guard = authGuard(mockRoute, mockState);
      return firstValueFrom(guard as Observable<boolean | UrlTree>);
    });

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('dispatches loadUser action when invoked', async () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, true);
    store.refreshState();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    await TestBed.runInInjectionContext(() => {
      const guard = authGuard(mockRoute, mockState);
      return firstValueFrom(guard as Observable<boolean | UrlTree>);
    });

    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.loadUser());
  });

  it('dispatches loadUser exactly once', async () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, true);
    store.refreshState();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    await TestBed.runInInjectionContext(() => {
      const guard = authGuard(mockRoute, mockState);
      return firstValueFrom(guard as Observable<boolean | UrlTree>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call router.createUrlTree when authenticated', async () => {
    store.overrideSelector(AuthSelectors.selectIsAuthenticated, true);
    store.refreshState();

    await TestBed.runInInjectionContext(() => {
      const guard = authGuard(mockRoute, mockState);
      return firstValueFrom(guard as Observable<boolean | UrlTree>);
    });

    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
