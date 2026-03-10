import { Injectable } from '@angular/core';
import { IProduct } from '@app/features/products/models/product.model';
import { EUserRole, IUser } from '@app/features/user/models/user.model';
import { DateUtils } from '@app/shared/utils/date.utils';
import { Utils } from '@app/shared/utils/utils';

export class StorageMock {
  private readonly STORAGE_KEY_PREFIX = 'MOCK_';

  get(key: string): unknown {
    const stored = localStorage.getItem(this.STORAGE_KEY_PREFIX + key);
    return stored ? JSON.parse(stored) : undefined;
  }

  set(key: string, value: unknown): void {
    localStorage.setItem(this.STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  }

  has(key: string): boolean {
    return localStorage.getItem(this.STORAGE_KEY_PREFIX + key) !== null;
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  get size(): number {
    return Object.keys(localStorage).filter((key) => key.startsWith(this.STORAGE_KEY_PREFIX))
      .length;
  }
}

export const STORAGE_MOCK = new StorageMock();

/**
 * Serviço centralizado para gerenciar dados mock
 */
@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  constructor() {
    this.initializeMockData();
  }

  /**
   * Inicializa dados mock no "banco de dados" simulado
   */
  private initializeMockData(): void {
    // Only initialize if STORAGE_MOCK is empty (prevents overwriting data in Cypress tests)
    if (STORAGE_MOCK.size > 0) {
      return;
    }

    // Produtos iniciais
    const products: IProduct[] = [
      {
        id: Utils.generateId(),
        name: 'Premium Coffee Beans',
        description: 'Arabica blend from Colombia with rich flavor notes',
        price: 29.99,
        image: '/assets/images/coffee.jpg',
        category: 'Food',
        stock: 50,
        rating: 4.5,
        createdAt: DateUtils.fromDate(2026, 1, 1),
        updatedAt: DateUtils.fromDate(2026, 1, 1),
      },
      {
        id: Utils.generateId(),
        name: 'Espresso Machine Pro',
        description: 'Professional grade espresso maker with 15 bar pressure',
        price: 499.99,
        image: '/assets/images/coffee.jpg',
        category: 'Electronics',
        stock: 15,
        rating: 4.8,
        createdAt: DateUtils.fromDate(2026, 1, 2),
        updatedAt: DateUtils.fromDate(2026, 1, 2),
      },
      {
        id: Utils.generateId(),
        name: 'Coffee Grinder Deluxe',
        description: 'Precision burr grinder with 15 settings',
        price: 79.99,
        image: '/assets/images/coffee.jpg',
        category: 'Electronics',
        stock: 8,
        rating: 4.3,
        createdAt: DateUtils.fromDate(2026, 1, 3),
        updatedAt: DateUtils.fromDate(2026, 1, 3),
      },
    ];

    STORAGE_MOCK.set('products', products);

    // Usuários iniciais
    const users: IUser[] = [
      {
        id: Utils.generateId(),
        email: 'admin@admin.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: EUserRole.ADMIN,
        createdAt: DateUtils.fromDate(2026, 1, 1),
        updatedAt: DateUtils.fromDate(2026, 1, 1),
      },
      {
        id: Utils.generateId(),
        email: 'user@user.com',
        password: 'user123',
        fullName: 'Regular User',
        role: EUserRole.USER,
        createdAt: DateUtils.fromDate(2026, 1, 2),
        updatedAt: DateUtils.fromDate(2026, 1, 2),
      },
    ];

    STORAGE_MOCK.set('users', users);
  }

  /**
   * Limpa todos os dados (útil para testes)
   */
  clear(): void {
    STORAGE_MOCK.clear();
    this.initializeMockData();
  }
}
