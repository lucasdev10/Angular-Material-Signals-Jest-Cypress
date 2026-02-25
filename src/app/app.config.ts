import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor, cacheInterceptor, errorInterceptor, loadingInterceptor } from './core';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';

/**
 * Configuração da aplicação
 *
 * Features habilitadas:
 * - Zoneless change detection (experimental) - melhor performance
 * - Animations async - lazy load de animações
 * - HTTP Client com fetch API - melhor performance
 * - Interceptors globais
 * - Router com input binding e view transitions
 * - Global error handler
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Change Detection Strategy
    // Zoneless (experimental - melhor performance)
    provideZonelessChangeDetection(),

    // Animations (lazy loaded)
    provideAnimationsAsync(),

    // HTTP Client com interceptors
    provideHttpClient(
      withFetch(), // Usa Fetch API em vez de XMLHttpRequest
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor, cacheInterceptor]),
    ),

    // Router com features modernas
    provideRouter(
      routes,
      withComponentInputBinding(), // Permite usar route params como @Input()
      withViewTransitions(), // Animações de transição entre rotas
    ),

    // Global Error Handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
};
