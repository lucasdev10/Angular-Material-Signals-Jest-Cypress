import { TestBed } from '@angular/core/testing';
import { CanComponentDeactivate, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  let mockComponent: CanComponentDeactivate;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    mockComponent = {
      canDeactivate: vi.fn(),
    };
  });

  it('should allow navigation when component can deactivate', () => {
    (mockComponent.canDeactivate as any).mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(mockComponent, {} as any, {} as any, {} as any),
    );

    expect(result).toBe(true);
    expect(mockComponent.canDeactivate).toHaveBeenCalled();
  });

  it('should show confirmation dialog when component cannot deactivate', () => {
    (mockComponent.canDeactivate as any).mockReturnValue(false);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(mockComponent, {} as any, {} as any, {} as any),
    );

    expect(confirmSpy).toHaveBeenCalledWith(
      'You have unsaved changes. Do you really want to leave?',
    );
    expect(result).toBe(true);

    confirmSpy.mockRestore();
  });

  it('should prevent navigation when user cancels confirmation', () => {
    (mockComponent.canDeactivate as any).mockReturnValue(false);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(mockComponent, {} as any, {} as any, {} as any),
    );

    expect(result).toBe(false);

    confirmSpy.mockRestore();
  });

  it('should allow navigation when component does not implement canDeactivate', () => {
    const componentWithoutMethod = {} as CanComponentDeactivate;

    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(componentWithoutMethod, {} as any, {} as any, {} as any),
    );

    expect(result).toBe(true);
  });

  it('should handle component with canDeactivate returning undefined', () => {
    (mockComponent.canDeactivate as any).mockReturnValue(undefined);

    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(mockComponent, {} as any, {} as any, {} as any),
    );

    expect(result).toBe(true);
  });
});
