import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FieldTree, form, min, required } from '@angular/forms/signals';
import { ProductForm } from '../../components/product-form/product-form';
import { IProduct } from '../../models/Product';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-create-page',
  imports: [ProductForm],
  templateUrl: './product-create-page.html',
  styleUrl: './product-create-page.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreatePageComponent {
  productService = inject(ProductService);

  productModel = signal<IProduct>({
    name: '',
    description: '',
    price: 0,
  });

  productForm = form(this.productModel, (fieldPath) => {
    required(fieldPath.name, { message: 'Name coffee is required' });
    required(fieldPath.description, { message: 'Description is required' });
    required(fieldPath.price, { message: 'Price is required' });
    min(fieldPath.price, 1, { message: 'Price must be greater than 1' });
  });

  saveProduct(event: FieldTree<unknown, string | number>) {
    this.productService.addProduct(event().value() as IProduct);
    this.resetForm();
  }

  resetForm() {
    this.productModel.set({
      name: '',
      description: '',
      price: 0,
    });

    this.productForm().reset();
  }
}
