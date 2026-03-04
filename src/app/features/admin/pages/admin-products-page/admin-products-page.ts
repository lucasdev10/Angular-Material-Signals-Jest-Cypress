import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { IProduct } from '@app/features/products/models/product.model';
import { ProductStore } from '@app/features/products/store/product.store';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-products-page',
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    RouterLink,
    CurrencyPipe,
  ],
  templateUrl: './admin-products-page.html',
  styleUrl: './admin-products-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AdminProductsPageComponent {
  protected readonly productStore = inject(ProductStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly products = this.productStore.products;
  readonly isLoading = this.productStore.isLoading;
  readonly error = this.productStore.error;

  readonly displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'actions'];

  constructor() {
    this.productStore.loadProducts();
  }

  onEdit(product: IProduct): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  onDelete(product: IProduct): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the product "${product.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.productStore.deleteProduct(product.id);
      }
    });
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  trackByProductId(index: number, product: IProduct): string {
    return product.id;
  }
}
