import { TestBed } from '@angular/core/testing';
import { StorageService } from '@app/core/storage/storage';
import { IProduct } from '@app/features/products/models/product.model';
import { Utils } from '@app/shared/utils/utils';
import moment from 'moment';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  let cartStore: CartStore;
  let storageService: StorageService<unknown>;

  let mockProduct: IProduct = {
    id: Utils.generateId(),
    name: 'Premium Coffee Beans',
    description: 'Arabica blend from Colombia with rich flavor notes',
    price: 29.99,
    image: '/assets/images/coffee.jpg',
    category: 'Food',
    stock: 50,
    rating: 4.5,
    createdAt: moment('2026-01-01').unix(),
    updatedAt: moment('2026-01-01').unix(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [CartStore, StorageService],
    }).compileComponents();

    cartStore = TestBed.inject(CartStore);
    storageService = TestBed.inject(StorageService);
    cartStore.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add item correctly', async () => {
    const mockItemsResponse = [
      {
        product: mockProduct,
        quantity: 1,
        subtotal: 29.99,
      },
    ];

    expect(cartStore.items().length).toBe(0);

    cartStore.addItem(mockProduct, 1);

    expect(cartStore.items()).toEqual(mockItemsResponse);
    expect(cartStore.items().length).toBe(1);
  });

  it('do not duplicate item', () => {
    const mockItemsResponse = [
      {
        product: mockProduct,
        quantity: 3,
        subtotal: 89.97,
      },
    ];

    cartStore.addItem(mockProduct, 1);
    cartStore.addItem(mockProduct, 2);

    expect(cartStore.items().length).toBe(1);
    expect(cartStore.items()).toEqual(mockItemsResponse);
  });

  it('should update quantity', () => {
    cartStore.addItem(mockProduct, 1);
    cartStore.updateQuantity(mockProduct.id, 2);

    expect(cartStore.items()[0].quantity).toBe(2);
  });

  it('should calculate shipping cost correctly', () => {
    cartStore.addItem(mockProduct, 1);
    expect(cartStore.shipping()).toBe(10);
  });

  it('should have free shipping when subtotal >= 100', () => {
    const expensiveProduct: IProduct = {
      ...mockProduct,
      price: 150,
    };

    cartStore.addItem(expensiveProduct, 1);
    expect(cartStore.hasFreeShipping()).toBe(true);
    expect(cartStore.shipping()).toBe(0);
  });

  it('should calculate tax correctly (10%)', () => {
    cartStore.addItem(mockProduct, 1);
    const expectedTax = 29.99 * 0.1;
    expect(cartStore.tax()).toBeCloseTo(expectedTax, 2);
  });

  it('should calculate total correctly', () => {
    cartStore.addItem(mockProduct, 2);
    const subtotal = 59.98;
    const tax = subtotal * 0.1;
    const shipping = 10;
    const expectedTotal = subtotal + tax + shipping;

    expect(cartStore.total()).toBeCloseTo(expectedTotal, 2);
  });

  it('should remove item correctly', () => {
    cartStore.addItem(mockProduct, 1);
    expect(cartStore.items().length).toBe(1);

    cartStore.removeItem(mockProduct.id);
    expect(cartStore.items().length).toBe(0);
    expect(cartStore.isEmpty()).toBe(true);
  });

  it('should update quantity to 0 and remove item', () => {
    cartStore.addItem(mockProduct, 1);
    cartStore.updateQuantity(mockProduct.id, 0);

    expect(cartStore.items().length).toBe(0);
  });

  it('should clear cart', () => {
    cartStore.addItem(mockProduct, 2);
    expect(cartStore.hasItems()).toBe(true);

    cartStore.clear();
    expect(cartStore.isEmpty()).toBe(true);
    expect(cartStore.itemCount()).toBe(0);
  });

  it('should calculate item count correctly', () => {
    const product2: IProduct = {
      ...mockProduct,
      id: Utils.generateId(),
      name: 'Product 2',
    };

    cartStore.addItem(mockProduct, 2);
    cartStore.addItem(product2, 3);

    expect(cartStore.itemCount()).toBe(5);
  });

  it('should persist cart to localStorage', async () => {
    cartStore.addItem(mockProduct, 1);

    await vi.waitFor(() => {
      const stored = storageService.get('cart');
      expect(stored).toBeDefined();
    });
  });

  it('should load cart from localStorage on initialization', () => {
    const mockInitialCart = {
      items: [
        {
          product: mockProduct,
          quantity: 2,
          subtotal: 59.98,
        },
      ],
      subtotal: 59.98,
      tax: 5.998,
      shipping: 10,
      total: 75.978,
      itemCount: 2,
    };

    storageService.set('cart', mockInitialCart);
    const newCartStore = TestBed.inject(CartStore);

    vi.waitFor(() => {
      expect(newCartStore.items().length).toBe(1);
      expect(newCartStore.itemCount()).toBe(2);
    });
  });

  it('should check if there is a shipping cost', () => {
    cartStore.addItem(mockProduct, 1);
    expect(cartStore.hasFreeShipping()).toBeFalsy();

    cartStore.addItem(mockProduct, 5);
    expect(cartStore.hasFreeShipping()).toBeTruthy();
  });

  it('should calculate total correctly', () => {
    cartStore.addItem(mockProduct, 1);
    cartStore.updateQuantity(mockProduct.id, 2);

    const total =
      mockProduct.price * cartStore.itemCount() + cartStore.shipping() + cartStore.tax();

    expect(cartStore.total()).toBe(total);
  });

  it('should remove item correctly', () => {
    cartStore.addItem(mockProduct, 1);
    expect(cartStore.items().length).toBe(1);

    cartStore.removeItem(mockProduct.id);
    expect(cartStore.items().length).toBe(0);
  });

  it('should recover saved state', () => {
    // Arrange - salvar dados no storage
    const savedCart = {
      items: [
        {
          product: mockProduct,
          quantity: 3,
          subtotal: 89.97,
        },
      ],
      subtotal: 89.97,
      shipping: 10,
      tax: 8.997,
      total: 108.967,
      itemCount: 3,
    };

    // Salvar no localStorage diretamente (como o StorageService faz)
    localStorage.setItem('cart', JSON.stringify(savedCart));

    // Act - criar uma nova instância da store
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [CartStore, StorageService],
    });
    const newStore = TestBed.inject(CartStore);

    // Assert
    expect(newStore.items().length).toBe(1);
    expect(newStore.items()[0].product.id).toBe(mockProduct.id);
    expect(newStore.items()[0].quantity).toBe(3);
    expect(newStore.itemCount()).toBe(3);
    expect(newStore.subtotal()).toBe(89.97);
  });

  it('should clean cart', () => {
    cartStore.addItem(mockProduct, 2);
    expect(cartStore.items().length).toBe(1);

    cartStore.clear();

    expect(cartStore.items().length).toBe(0);
  });
});
