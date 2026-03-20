import { IProduct } from '../../models/product.model';
import { IProductState } from '../product.state';
import {
  selectError,
  selectFilteredProductCount,
  selectFilteredProducts,
  selectFilters,
  selectHasError,
  selectIsLoading,
  selectLoading,
  selectLowStockProducts,
  selectProducts,
  selectProductState,
  selectSelectedProduct,
  selectTotalProducts,
  selectTotalValue,
} from './product.selectors';

describe('Product Selectors', () => {
  let mockProducts: IProduct[] = [
    {
      id: 'product-id-1',
      name: 'Premium Coffee Beans',
      description: 'Arabica blend from Colombia with rich flavor notes',
      price: 29.99,
      image: '/assets/images/coffee.jpg',
      category: 'Food',
      stock: 50,
      rating: 4.5,
      createdAt: 1774015190,
      updatedAt: 1774015190,
    },
    {
      id: 'product-id-2',
      name: 'Espresso Machine Pro',
      description: 'Professional grade espresso maker with 15 bar pressure',
      price: 499.99,
      image: '/assets/images/coffee.jpg',
      category: 'Electronics',
      stock: 15,
      rating: 4.8,
      createdAt: 1774015190,
      updatedAt: 1774015190,
    },
  ];

  const createMockState = (overrides: Partial<IProductState> = {}): { product: IProductState } => ({
    product: {
      products: mockProducts,
      selectedProduct: null,
      filters: {},
      loading: 'success' as const,
      error: null,
      ...overrides,
    },
  });

  describe('selectProductState', () => {
    it('should select the product state', () => {
      const state = createMockState();
      const result = selectProductState.projector(state.product);
      expect(result).toEqual(state.product);
    });
  });

  describe('selectProducts', () => {
    it('should select products', () => {
      const state = createMockState();
      const result = selectProducts.projector(state.product);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('selectSelectedProduct', () => {
    it('should select selected product', () => {
      const state = createMockState({ selectedProduct: mockProducts[0] });
      const result = selectSelectedProduct.projector(state.product);
      expect(result).toEqual(mockProducts[0]);
    });

    it('should return null when no product selected', () => {
      const state = createMockState({ selectedProduct: null });
      const result = selectSelectedProduct.projector(state.product);
      expect(result).toBeNull();
    });
  });

  describe('selectFilters', () => {
    it('should select filters', () => {
      const filters = { search: 'premium' };
      const state = createMockState({ filters });
      const result = selectFilters.projector(state.product);
      expect(result).toEqual(filters);
    });

    it('should select empty filters', () => {
      const state = createMockState({ filters: {} });
      const result = selectFilters.projector(state.product);
      expect(result).toEqual({});
    });
  });

  describe('selectLoading', () => {
    it('should select loading state', () => {
      const state = createMockState({ loading: 'loading' });
      const result = selectLoading.projector(state.product);
      expect(result).toBe('loading');
    });

    it('should select success state', () => {
      const state = createMockState({ loading: 'success' });
      const result = selectLoading.projector(state.product);
      expect(result).toBe('success');
    });
  });

  describe('selectError', () => {
    it('should select null when no error', () => {
      const state = createMockState({ error: null });
      const result = selectError.projector(state.product);
      expect(result).toBeNull();
    });

    it('should select error when present', () => {
      const state = createMockState({ error: 'Test error' });
      const result = selectError.projector(state.product);
      expect(result).toBe('Test error');
    });
  });

  describe('selectIsLoading', () => {
    it('should return false when not loading', () => {
      const result = selectIsLoading.projector('success');
      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      const result = selectIsLoading.projector('loading');
      expect(result).toBe(true);
    });

    it('should return false when idle', () => {
      const result = selectIsLoading.projector('idle');
      expect(result).toBe(false);
    });

    it('should return false when error', () => {
      const result = selectIsLoading.projector('error');
      expect(result).toBe(false);
    });
  });

  describe('selectHasError', () => {
    it('should return false when no error', () => {
      const result = selectHasError.projector(null);
      expect(result).toBe(false);
    });

    it('should return true when error exists', () => {
      const result = selectHasError.projector('Test error');
      expect(result).toBe(true);
    });
  });

  describe('selectFilteredProducts', () => {
    it('should return all products when no filter', () => {
      const result = selectFilteredProducts.projector(mockProducts, {});
      expect(result).toEqual(mockProducts);
      expect(result.length).toBe(2);
    });

    it('should filter products by name (case insensitive)', () => {
      const result = selectFilteredProducts.projector(mockProducts, { search: 'premium' });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Premium Coffee Beans');
    });

    it('should filter products by name (uppercase)', () => {
      const result = selectFilteredProducts.projector(mockProducts, { search: 'PREMIUM' });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Premium Coffee Beans');
    });

    it('should filter products by partial name', () => {
      const result = selectFilteredProducts.projector(mockProducts, { search: 'Coffee' });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Premium Coffee Beans');
    });

    it('should return empty array when no match', () => {
      const result = selectFilteredProducts.projector(mockProducts, { search: 'nonexistent' });
      expect(result.length).toBe(0);
    });

    it('should handle empty search string', () => {
      const result = selectFilteredProducts.projector(mockProducts, { search: '' });
      expect(result).toEqual(mockProducts);
      expect(result.length).toBe(2);
    });

    it('should handle undefined search', () => {
      const result = selectFilteredProducts.projector(mockProducts, {});
      expect(result).toEqual(mockProducts);
      expect(result.length).toBe(2);
    });
  });

  describe('selectTotalProducts', () => {
    it('should return correct product count', () => {
      const result = selectTotalProducts.projector(mockProducts);
      expect(result).toBe(2);
    });

    it('should return 0 for empty products array', () => {
      const result = selectTotalProducts.projector([]);
      expect(result).toBe(0);
    });

    it('should return correct count for single product', () => {
      const result = selectTotalProducts.projector([mockProducts[0]]);
      expect(result).toBe(1);
    });
  });

  describe('selectFilteredProductCount', () => {
    it('should return total count when no filter', () => {
      const result = selectFilteredProductCount.projector(mockProducts);
      expect(result).toBe(2);
    });

    it('should return filtered count when filter matches one product', () => {
      const filteredProducts = [mockProducts[0]]; // Simula o resultado do selectFilteredProducts
      const result = selectFilteredProductCount.projector(filteredProducts);
      expect(result).toBe(1);
    });

    it('should return 0 when filter matches no products', () => {
      const filteredProducts: IProduct[] = []; // Simula o resultado do selectFilteredProducts
      const result = selectFilteredProductCount.projector(filteredProducts);
      expect(result).toBe(0);
    });

    it('should return total count for all products', () => {
      const result = selectFilteredProductCount.projector(mockProducts);
      expect(result).toBe(2);
    });
  });

  describe('selectLowStockProducts', () => {
    it('should return products with low stock', () => {
      const result = selectLowStockProducts.projector(mockProducts);
      expect(result).toBe(0);
    });
  });

  describe('selectTotalValue', () => {
    it('should return total value', () => {
      const result = selectTotalValue.projector(mockProducts);
      expect(result).toBe(529.98);
    });
  });

  describe('integration tests', () => {
    it('should work with complete state object', () => {
      const state = createMockState({
        filters: { search: 'premium' },
      });

      // Test the complete selector chain
      const userState = selectProductState.projector(state.product);
      const products = selectProducts.projector(userState);
      const filters = selectFilters.projector(userState);
      const filteredProducts = selectFilteredProducts.projector(products, filters);
      const filteredCount = selectFilteredProductCount.projector(filteredProducts);

      expect(products).toEqual(mockProducts);
      expect(filters).toEqual({ search: 'premium' });
      expect(filteredProducts.length).toBe(1);
      expect(filteredProducts[0].name).toBe('Premium Coffee Beans');
      expect(filteredCount).toBe(1);
    });
  });
});
