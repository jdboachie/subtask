import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { unsavedChangesGuard, HasUnsavedChanges } from './unsaved-changes';

describe('unsavedChangesGuard', () => {
  const mockCurrentRoute = {} as ActivatedRouteSnapshot;
  const mockCurrentState = {} as RouterStateSnapshot;
  const mockNextState = {} as RouterStateSnapshot;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true immediately when component has no unsaved changes', () => {
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => false };

    const result = unsavedChangesGuard(
      component,
      mockCurrentRoute,
      mockCurrentState,
      mockNextState,
    );

    expect(result).toBe(true);
  });

  it('does not call window.confirm when there are no unsaved changes', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => false };

    unsavedChangesGuard(component, mockCurrentRoute, mockCurrentState, mockNextState);

    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('calls window.confirm when component has unsaved changes', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };

    unsavedChangesGuard(component, mockCurrentRoute, mockCurrentState, mockNextState);

    expect(window.confirm).toHaveBeenCalledTimes(1);
  });

  it('shows the correct confirmation message', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };

    unsavedChangesGuard(component, mockCurrentRoute, mockCurrentState, mockNextState);

    expect(confirmSpy).toHaveBeenCalledWith(
      'You have unsaved changes. Are you sure you want to leave?',
    );
  });

  it('returns true when user confirms navigation with unsaved changes', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };

    const result = unsavedChangesGuard(
      component,
      mockCurrentRoute,
      mockCurrentState,
      mockNextState,
    );

    expect(result).toBe(true);
  });

  it('returns false when user cancels navigation with unsaved changes', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };

    const result = unsavedChangesGuard(
      component,
      mockCurrentRoute,
      mockCurrentState,
      mockNextState,
    );

    expect(result).toBe(false);
  });

  it('calls hasUnsavedChanges exactly once', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const hasUnsavedChangesSpy = jest.fn().mockReturnValue(true);
    const component: HasUnsavedChanges = { hasUnsavedChanges: hasUnsavedChangesSpy };

    unsavedChangesGuard(component, mockCurrentRoute, mockCurrentState, mockNextState);

    expect(hasUnsavedChangesSpy).toHaveBeenCalledTimes(1);
  });
});
