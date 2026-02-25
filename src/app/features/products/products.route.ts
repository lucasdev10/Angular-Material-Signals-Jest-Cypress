import { Routes } from '@angular/router';
import { ProductCreatePageComponent } from './pages/product-create-page/product-create-page';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ProductListPageComponent,
  },
  {
    path: 'create',
    component: ProductCreatePageComponent,
  },
];
