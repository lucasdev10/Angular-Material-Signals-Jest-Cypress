import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-dashboard-page/admin-dashboard-page').then(
        (c) => c.AdminDashboardPageComponent,
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/admin-products-page/admin-products-page').then(
        (c) => c.AdminProductsPageComponent,
      ),
  },
  {
    path: 'products/create',
    loadComponent: () =>
      import('./pages/admin-product-form-page/admin-product-form-page').then(
        (c) => c.AdminProductFormPageComponent,
      ),
  },
  {
    path: 'products/edit/:id',
    loadComponent: () =>
      import('./pages/admin-product-form-page/admin-product-form-page').then(
        (c) => c.AdminProductFormPageComponent,
      ),
  },
];
