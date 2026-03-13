import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingState } from '@app/shared';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  ICreateProductDto,
  IProduct,
  IProductFilters,
  IProductStoreState,
} from '../models/product.model';
import { ProductRepository } from './../repositories/product.repository';

const initialState: IProductStoreState = {
  products: [],
  selectedProduct: null,
  filters: {},
  loading: 'idle',
  error: null,
};

/**
 * Store de produtos usando SignalsStore
 * Gerencia estado global dos produtos de forma reativa
 */
export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const filteredProducts = computed(() => {
      const products = store.products();
      const filters = store.filters();

      return products.filter((product) => {
        if (filters.category && product.category !== filters.category) {
          return false;
        }

        if (filters.minPrice && product.price < filters.minPrice) {
          return false;
        }

        if (filters.maxPrice && product.price > filters.maxPrice) {
          return false;
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(searchLower);
          const matchesDescription = product.description.toLowerCase().includes(searchLower);
          if (!matchesName && !matchesDescription) {
            return false;
          }
        }

        if (filters.inStock && product.stock <= 0) {
          return false;
        }

        return true;
      });
    });

    return {
      filteredProducts,
      products: computed(() => store.products()),
      selectedProduct: computed(() => store.selectedProduct()),
      filters: computed(() => store.filters()),
      loading: computed(() => store.loading()),
      error: computed(() => store.error()),
      isLoading: computed(() => store.loading() === 'loading'),
      hasError: computed(() => store.error() !== null),
      productCount: computed(() => store.products().length),
      filteredProductCount: computed(() => filteredProducts().length),
      categories: computed(() => {
        const products = store.products();
        return [...new Set(products.map((p) => p.category))].sort();
      }),
    };
  }),
  withMethods((store, repository = inject(ProductRepository), destroyRef = inject(DestroyRef)) => ({
    loadProducts(): void {
      this._setLoading('loading');

      repository
        .findAll()
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (products) => {
            patchState(store, {
              products,
              loading: 'success',
              error: null,
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to load products',
            });
          },
        });
    },
    loadProductById(id: string): void {
      this._setLoading('loading');

      repository
        .findById(id)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (product) => {
            patchState(store, {
              selectedProduct: product,
              loading: 'success',
              error: null,
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to load product',
            });
          },
        });
    },
    createProduct(dto: ICreateProductDto): void {
      this._setLoading('loading');

      repository
        .create(dto)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (product) => {
            patchState(store, {
              products: [...store.products(), product],
              loading: 'success',
              error: null,
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to create product',
            });
          },
        });
    },
    updateProduct(id: string, dto: Partial<IProduct>): void {
      this._setLoading('loading');

      repository
        .update(id, dto)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (updatedProduct) => {
            patchState(store, {
              products: store.products().map((p) => (p.id === id ? updatedProduct : p)),
              selectedProduct:
                store.selectedProduct()?.id === id ? updatedProduct : store.selectedProduct(),
              loading: 'success',
              error: null,
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to update product',
            });
          },
        });
    },
    deleteProduct(id: string): void {
      this._setLoading('loading');

      repository
        .delete(id)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: () => {
            patchState(store, {
              products: store.products().filter((p) => p.id !== id),
              selectedProduct: store.selectedProduct()?.id === id ? null : store.selectedProduct(),
              loading: 'success',
              error: null,
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to delete product',
            });
          },
        });
    },
    setFilters(filters: IProductFilters): void {
      patchState(store, {
        filters: { ...store.filters(), ...filters },
      });
    },
    clearFilters(): void {
      patchState(store, {
        filters: {},
      });
    },
    clearError(): void {
      patchState(store, {
        error: null,
      });
    },
    _setLoading(loading: LoadingState): void {
      patchState(store, {
        loading,
      });
    },
  })),
  withHooks((store) => ({
    onInit: () => {
      // Auto-carrega produtos na inicialização
      store.loadProducts();
    },
  })),
);
