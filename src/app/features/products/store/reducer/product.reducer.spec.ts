import { IProduct } from '../../models/product.model';
import { ProductActions } from '../product.actions';
import { initialProductState, IProductState } from '../product.state';
import { productReducer } from './product.reducer';

describe('ProductReducer', () => {
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

  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = productReducer(initialProductState, action);

      expect(state).toBe(initialProductState);
    });
  });

  describe('Load Products', () => {
    it('should set loading state on loadProducts', () => {
      const action = ProductActions.loadProducts();
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should set products on loadProductsSuccess', () => {
      const action = ProductActions.loadProductsSuccess({ products: mockProducts });
      const state = productReducer(initialProductState, action);

      expect(state.products).toEqual(mockProducts);
      expect(state.loading).toBe('success');
      expect(state.error).toBeNull();
    });

    it('should set error on loadProductsError', () => {
      const error = 'Failed to load products';
      const action = ProductActions.loadProductsError({ error });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('error');
      expect(state.error).toBe(error);
    });
  });

  describe('Load Products By Id', () => {
    it('should set loading state on loadProductById', () => {
      const action = ProductActions.loadProductById({ id: mockProducts[0].id });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should set product on loadProductByIdSuccess', () => {
      const action = ProductActions.loadProductByIdSuccess({ product: mockProducts[0] });
      const state = productReducer(initialProductState, action);

      expect(state.selectedProduct).toEqual(mockProducts[0]);
      expect(state.loading).toBe('success');
      expect(state.error).toBeNull();
    });

    it('should set error on loadProductByIdError', () => {
      const error = 'Failed to load products';
      const action = ProductActions.loadProductByIdError({ error });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('error');
      expect(state.error).toBe(error);
    });
  });

  describe('Create Product', () => {
    it('should set loading state on createProduct', () => {
      const dto = {
        name: 'test',
        description: 'test',
        price: 1,
        category: 'test',
        stock: 1,
        rating: 1,
        image: 'test',
      };

      const action = ProductActions.createProduct({ product: dto });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should add product on createProductSuccess', () => {
      const newProduct = {
        id: 'product-id-3',
        name: 'test',
        description: 'test',
        price: 1,
        category: 'test',
        stock: 1,
        rating: 1,
        image: 'test',
        createdAt: 1774015190,
        updatedAt: 1774015190,
      };

      const stateWithProducts: IProductState = {
        ...initialProductState,
        products: mockProducts,
      };

      const action = ProductActions.createProductSuccess({ product: newProduct });
      const state = productReducer(stateWithProducts, action);

      expect(state.products.length).toBe(3);
      expect(state.products).toContain(newProduct);
      expect(state.loading).toBe('success');
      expect(state.error).toBeNull();
    });

    it('should set error on createProductError', () => {
      const error = 'Failed to create product';
      const action = ProductActions.createProductError({ error });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('error');
      expect(state.error).toBe(error);
    });
  });

  describe('Update Product', () => {
    it('should set loading state on updateProduct', () => {
      const action = ProductActions.updateProduct({ id: 'test-id', product: { name: 'Updated' } });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should update product on updateProductSuccess', () => {
      const updatedProduct = { ...mockProducts[0], name: 'Updated Name' };
      const stateWithProducts: IProductState = {
        ...initialProductState,
        products: mockProducts,
      };

      const action = ProductActions.updateProductSuccess({ product: updatedProduct });
      const state = productReducer(stateWithProducts, action);

      const product = state.products.find((p) => p.id === mockProducts[0].id);
      expect(product?.name).toBe('Updated Name');
      expect(state.loading).toBe('success');
      expect(state.error).toBeNull();
    });

    it('should update selected product if it matches', () => {
      const updatedProduct = { ...mockProducts[0], name: 'Updated Selected' };
      const stateWithSelection: IProductState = {
        ...initialProductState,
        products: mockProducts,
        selectedProduct: mockProducts[0],
      };

      const action = ProductActions.updateProductSuccess({ product: updatedProduct });
      const state = productReducer(stateWithSelection, action);

      expect(state.selectedProduct?.name).toBe('Updated Selected');
    });

    it('should set error on updateProductError', () => {
      const error = 'Failed to update product';
      const action = ProductActions.updateProductError({ error });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('error');
      expect(state.error).toBe(error);
    });
  });

  describe('Delete Product', () => {
    it('should set loading state on deleteProduct', () => {
      const action = ProductActions.deleteProduct({ id: 'test-id' });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should remove product on deleteProductSuccess', () => {
      const stateWithProducts: IProductState = {
        ...initialProductState,
        products: mockProducts,
      };

      const action = ProductActions.deleteProductSuccess({ id: mockProducts[0].id });
      const state = productReducer(stateWithProducts, action);

      expect(state.products.length).toBe(1);
      expect(state.products.find((p) => p.id === mockProducts[0].id)).toBeUndefined();
      expect(state.loading).toBe('success');
      expect(state.error).toBeNull();
    });

    it('should clear selected product if it matches deleted product', () => {
      const stateWithSelection: IProductState = {
        ...initialProductState,
        products: mockProducts,
        selectedProduct: mockProducts[0],
      };

      const action = ProductActions.deleteProductSuccess({ id: mockProducts[0].id });
      const state = productReducer(stateWithSelection, action);

      expect(state.selectedProduct).toBeNull();
    });

    it('should set error on deleteProductError', () => {
      const error = 'Failed to delete product';
      const action = ProductActions.deleteProductError({ error });
      const state = productReducer(initialProductState, action);

      expect(state.loading).toBe('error');
      expect(state.error).toBe(error);
    });
  });

  describe('Filters', () => {
    it('should set filters on setFilters', () => {
      const filters = { search: 'Espresso Machine Pro' };
      const action = ProductActions.setProductFilters({ filters });
      const state = productReducer(initialProductState, action);

      expect(state.filters).toEqual(filters);
    });

    it('should merge filters on setFilters', () => {
      const stateWithFilters: IProductState = {
        ...initialProductState,
        filters: { search: 'old' },
      };

      const filters = { search: 'new' };
      const action = ProductActions.setProductFilters({ filters });
      const state = productReducer(stateWithFilters, action);

      expect(state.filters.search).toBe('new');
    });

    it('should clear filters on clearFilters', () => {
      const stateWithFilters: IProductState = {
        ...initialProductState,
        filters: { search: 'test' },
      };

      const action = ProductActions.cleanProductFilters();
      const state = productReducer(stateWithFilters, action);

      expect(state.filters).toEqual({});
    });
  });
});
