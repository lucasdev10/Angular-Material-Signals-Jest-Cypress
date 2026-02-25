import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CartStore } from '@app/features/cart/store/cart.store';
import { ProductStore } from '@app/features/products/store/product.store';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink, CurrencyPipe],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AdminDashboardPageComponent {
  private readonly productStore = inject(ProductStore);
  private readonly cartStore = inject(CartStore);

  readonly totalProducts = computed(() => this.productStore.products().length);
  readonly totalValue = computed(() =>
    this.productStore.products().reduce((sum, p) => sum + p.price, 0),
  );
  readonly lowStockProducts = computed(
    () => this.productStore.products().filter((p) => p.stock < 10).length,
  );
  readonly totalOrders = computed(() => this.cartStore.itemCount());

  constructor() {
    this.productStore.loadProducts();
  }
}
