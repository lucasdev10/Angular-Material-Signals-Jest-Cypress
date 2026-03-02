import { TestBed } from '@angular/core/testing';
import { Utils } from '@app/shared/utils/utils';
import moment from 'moment';
import { of, throwError } from 'rxjs';
import { IProduct } from '../models/product.model';
import { ProductRepository } from '../repositories/product.repository';
import { ProductStore } from './product.store';

describe('ProductStore', () => {
  let productStore: ProductStore;
  let productRepository: ProductRepository;

  let mockProducts: IProduct[] = [
    {
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
      createdAt: moment('2026-01-02').unix(),
      updatedAt: moment('2026-01-02').unix(),
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [],
    }).compileComponents();

    productStore = TestBed.inject(ProductStore);
    productRepository = TestBed.inject(ProductRepository);
  });

  it('should update loading correctly', () => {
    const mockRepository = vi.spyOn(productRepository, 'findAll');
    mockRepository.mockReturnValue(of([]));
    expect(productStore.isLoading()).toBe(true);

    productStore.loadProducts();

    expect(productStore.isLoading()).toBe(false);
  });

  it('should load products correctly', () => {
    const mockRepository = vi.spyOn(productRepository, 'findAll');
    mockRepository.mockReturnValue(of(mockProducts));

    productStore.loadProducts();

    expect(productStore.products()).toEqual(mockProducts);
  });

  it('should update the error after it fails', () => {
    const mockRepository = vi.spyOn(productRepository, 'findAll');
    mockRepository.mockReturnValue(throwError(() => new Error('Failed to load products')));
    expect(productStore.error()).toBeNull();

    productStore.loadProducts();

    expect(productStore.error()).toBe('Failed to load products');
  });

  describe('filtering', () => {
    beforeEach(() => {
      const mockRepository = vi.spyOn(productRepository, 'findAll');
      mockRepository.mockReturnValue(of(mockProducts));
      productStore.loadProducts();
    });

    it('should filter products by category', () => {
      productStore.setFilters({ category: 'Food' });

      const filtered = productStore.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].category).toBe('Food');
    });

    it('should filter products by price range', () => {
      productStore.setFilters({ minPrice: 100, maxPrice: 500 });

      const filtered = productStore.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].price).toBe(499.99);
    });

    it('should filter products by search text', () => {
      productStore.setFilters({ search: 'espresso' });

      const filtered = productStore.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toContain('Espresso');
    });

    it('should filter products by stock availability', () => {
      productStore.setFilters({ inStock: true });

      const filtered = productStore.filteredProducts();
      expect(filtered.every((p) => p.stock > 0)).toBe(true);
    });

    it('should combine multiple filters', () => {
      productStore.setFilters({
        category: 'Electronics',
        minPrice: 400,
        search: 'machine',
      });

      const filtered = productStore.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toContain('Machine');
    });

    it('should clear filters', () => {
      productStore.setFilters({ category: 'Food' });
      expect(productStore.filteredProducts().length).toBe(1);

      productStore.clearFilters();
      expect(productStore.filteredProducts().length).toBe(2);
    });
  });

  describe('CRUD operations', () => {
    it('should create product', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'Test',
        price: 50,
        image: '/test.jpg',
        category: 'Test',
        stock: 10,
      };

      const mockCreate = vi.spyOn(productRepository, 'create');
      mockCreate.mockReturnValue(
        of({
          ...newProduct,
          id: 'new-id',
          rating: 0,
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
        }),
      );

      productStore.createProduct(newProduct);

      await vi.waitFor(() => {
        expect(productStore.products().length).toBe(1);
      });
    });

    it('should update product', async () => {
      const mockFindAll = vi.spyOn(productRepository, 'findAll');
      mockFindAll.mockReturnValue(of(mockProducts));
      productStore.loadProducts();

      const updatedProduct = { ...mockProducts[0], name: 'Updated Name' };
      const mockUpdate = vi.spyOn(productRepository, 'update');
      mockUpdate.mockReturnValue(of(updatedProduct));

      productStore.updateProduct(mockProducts[0].id, { name: 'Updated Name' });

      await vi.waitFor(() => {
        const product = productStore.products().find((p) => p.id === mockProducts[0].id);
        expect(product?.name).toBe('Updated Name');
      });
    });

    it('should delete product', async () => {
      const mockFindAll = vi.spyOn(productRepository, 'findAll');
      mockFindAll.mockReturnValue(of(mockProducts));
      productStore.loadProducts();

      const mockDelete = vi.spyOn(productRepository, 'delete');
      mockDelete.mockReturnValue(of(void 0));

      productStore.deleteProduct(mockProducts[0].id);

      await vi.waitFor(() => {
        expect(productStore.products().length).toBe(1);
      });
    });

    it('should handle create error', async () => {
      const mockCreate = vi.spyOn(productRepository, 'create');
      mockCreate.mockReturnValue(throwError(() => new Error('Create failed')));

      productStore.createProduct({
        name: 'Test',
        description: 'Test',
        price: 10,
        image: '',
        category: 'Test',
        stock: 1,
      });

      await vi.waitFor(() => {
        expect(productStore.error()).toBe('Create failed');
      });
    });
  });

  describe('computed signals', () => {
    it('should calculate categories correctly', () => {
      const mockRepository = vi.spyOn(productRepository, 'findAll');
      mockRepository.mockReturnValue(of(mockProducts));
      productStore.loadProducts();

      const categories = productStore.categories();
      expect(categories).toContain('Food');
      expect(categories).toContain('Electronics');
    });

    it('should return loading states', () => {
      expect(productStore.isLoading()).toBe(true);
      expect(productStore.hasError()).toBe(false);
    });
  });
});
