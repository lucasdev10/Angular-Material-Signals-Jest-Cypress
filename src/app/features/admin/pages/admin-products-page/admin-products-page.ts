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
import { Product } from '@app/features/products/models/product.model';
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

  onEdit(product: Product): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  onDelete(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o produto "${product.name}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
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
}
