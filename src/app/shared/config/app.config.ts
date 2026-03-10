import { environment } from '@environments/environment';

/**
 * Configuração centralizada da aplicação
 * Centraliza todas as constantes e configurações em um local
 */
export const APP_CONFIG = {
  // Configurações do carrinho
  cart: {
    TAX_RATE: 0.1, // 10% de imposto
    SHIPPING_THRESHOLD: 100, // Frete grátis acima de $100
    SHIPPING_COST: 10, // Custo do frete padrão
    FREE_SHIPPING_THRESHOLD: 100, // Limite para frete grátis
    MAX_QUANTITY_PER_ITEM: 99, // Quantidade máxima por item
    MIN_QUANTITY_PER_ITEM: 1, // Quantidade mínima por item
  },

  // Configurações da API
  api: {
    BASE_URL: environment.apiUrl || 'http://localhost:3000',
    TIMEOUT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 segundo
  },

  // Configurações de paginação
  pagination: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  },

  // Configurações de validação
  validation: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 254,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
  },

  // Configurações de UI
  ui: {
    DEBOUNCE_TIME: 300, // ms para debounce de inputs
    TOAST_DURATION: 5000, // 5 segundos
    LOADING_DELAY: 200, // Delay antes de mostrar loading
    ANIMATION_DURATION: 300, // Duração padrão de animações
  },

  // Configurações de storage
  storage: {
    CART_KEY: 'cart',
    AUTH_TOKEN_KEY: 'auth_token',
    AUTH_USER_KEY: 'auth_user',
    THEME_KEY: 'theme',
    LANGUAGE_KEY: 'language',
  },

  // Configurações de produtos
  products: {
    DEFAULT_IMAGE: '/assets/images/coffee.jpg',
    MAX_IMAGES_PER_PRODUCT: 5,
    SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // Configurações de busca
  search: {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 100,
    SEARCH_DEBOUNCE: 300,
    MAX_SEARCH_RESULTS: 50,
  },

  // Configurações de cache
  cache: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
    MAX_CACHE_SIZE: 100,
    CACHE_KEY_PREFIX: 'app_cache_',
  },

  // Configurações de logs
  logging: {
    ENABLED: !environment.production,
    LEVEL: environment.production ? 'error' : 'debug',
    MAX_LOG_ENTRIES: 1000,
  },

  // Configurações de performance
  performance: {
    LAZY_LOADING_THRESHOLD: 100, // pixels
    VIRTUAL_SCROLL_ITEM_SIZE: 50,
    MAX_CONCURRENT_REQUESTS: 6,
  },

  // Configurações de segurança
  security: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes do vencimento
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  },

  // URLs e rotas
  routes: {
    DEFAULT_REDIRECT: '/products',
    LOGIN_REDIRECT: '/auth/login',
    ADMIN_REDIRECT: '/admin',
    UNAUTHORIZED_REDIRECT: '/products',
  },

  // Configurações de notificações
  notifications: {
    MAX_NOTIFICATIONS: 5,
    AUTO_DISMISS_DELAY: 5000,
    POSITION: 'top-right' as const,
  },

  // Configurações de formulários
  forms: {
    AUTO_SAVE_DELAY: 2000, // 2 segundos
    VALIDATION_DEBOUNCE: 300,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },
} as const;

/**
 * Tipo para configuração da aplicação
 * Garante type safety ao acessar configurações
 */
export type AppConfig = typeof APP_CONFIG;

/**
 * Helper para acessar configurações de forma type-safe
 */
export function getConfig<T extends keyof AppConfig>(section: T): AppConfig[T] {
  return APP_CONFIG[section];
}

/**
 * Helper para acessar configurações aninhadas
 */
export function getNestedConfig<T extends keyof AppConfig, K extends keyof AppConfig[T]>(
  section: T,
  key: K,
): AppConfig[T][K] {
  return APP_CONFIG[section][key];
}
