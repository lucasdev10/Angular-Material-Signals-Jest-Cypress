import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IProductState } from '../product.state';

export const selectProductState = createFeatureSelector<IProductState>('product');

export const selectProducts = createSelector(selectProductState, (state) => state.products);

export const selectTotalProducts = createSelector(selectProducts, (products) => products.length);

export const selectTotalValue = createSelector(selectProducts, (products) =>
  products.reduce((sum, p) => sum + p.price, 0),
);

export const selectLowStockProducts = createSelector(
  selectProducts,
  (products) => products.filter((p) => p.stock < 10).length,
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  (state) => state.selectedProduct,
);

export const selectFilters = createSelector(selectProductState, (state) => state.filters);

export const selectFilteredProducts = createSelector(
  selectProducts,
  selectFilters,
  (products, filters) => {
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
  },
);

export const selectFilteredProductCount = createSelector(
  selectFilteredProducts,
  (products) => products.length,
);

export const selectLoading = createSelector(selectProductState, (state) => state.loading);

export const selectIsLoading = createSelector(selectLoading, (loading) => loading === 'loading');

export const selectError = createSelector(selectProductState, (state) => state.error);

export const selectHasError = createSelector(selectError, (error) => error !== null);
