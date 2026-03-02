import { CanDeactivateFn } from '@angular/router';

/**
 * Interface para componentes que podem ter mudanças não salvas
 */
export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

/**
 * Guard para prevenir navegação com mudanças não salvas
 * Exemplo de uso:
 * { path: 'edit/:id', canDeactivate: [unsavedChangesGuard], ... }
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.canDeactivate && component.canDeactivate() === false) {
    return confirm('You have unsaved changes. Do you really want to leave?');
  }

  return true;
};
