import { Component } from '@angular/core';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent],
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.scss',
  standalone: true,
})
export class ProductListPageComponent {}
