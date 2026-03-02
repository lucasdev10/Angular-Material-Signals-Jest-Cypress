import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IProduct } from '../../models/product.model';
import { ProductCardComponent } from './product-card';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  const mockProduct: IProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    image: 'test-image.jpg',
    category: 'Test Category',
    stock: 10,
    rating: 4.5,
    createdAt: 1234567890,
    updatedAt: 1234567890,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('product', mockProduct);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const productName = compiled.querySelector('.product-name');

    expect(productName?.textContent).toContain('Test Product');
  });

  it('should display product description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const description = compiled.querySelector('.product-description');

    expect(description?.textContent).toContain('Test Description');
  });

  it('should display product price', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const price = compiled.querySelector('.product-price');

    expect(price?.textContent).toContain('100');
  });

  it('should display product image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const image = compiled.querySelector('img') as HTMLImageElement;

    expect(image.src).toContain('test-image.jpg');
    expect(image.alt).toContain('Test Product');
  });

  it('should display product rating', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rating = compiled.querySelector('.product-rating');

    expect(rating?.textContent).toContain('4.5');
  });

  it('should display stock status', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stock = compiled.querySelector('.stock-status');

    expect(stock?.textContent).toContain('In Stock');
  });

  it('should show out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    fixture.componentRef.setInput('product', outOfStockProduct);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const stock = compiled.querySelector('.out-of-stock');

    expect(stock?.textContent).toContain('Out of Stock');
  });

  it('should emit addToCart event when button is clicked', () => {
    const addToCartSpy = vi.fn();
    component.addToCart.subscribe(addToCartSpy);

    const button = fixture.debugElement.query(By.css('#add-to-cart-button'));
    button.nativeElement.click();

    expect(addToCartSpy).toHaveBeenCalledWith(mockProduct);
  });

  it('should disable add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    fixture.componentRef.setInput('product', outOfStockProduct);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('#add-to-cart-button') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should handle missing image gracefully', () => {
    const productWithoutImage = { ...mockProduct, image: '' };
    fixture.componentRef.setInput('product', productWithoutImage);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.src).toContain('http://');
  });

  it('should format price correctly', () => {
    const expensiveProduct = { ...mockProduct, price: 1234.56 };
    fixture.componentRef.setInput('product', expensiveProduct);
    fixture.detectChanges();

    const price = fixture.nativeElement.querySelector('.product-price');

    expect(price?.textContent).toContain('1,234.56');
  });

  // it('should show discount badge when on sale', () => {
  //   const saleProduct = { ...mockProduct, discount: 20 };
  //   fixture.componentRef.setInput('product', saleProduct as any);
  //   fixture.detectChanges();

  //   const discountBadge = fixture.nativeElement.querySelector('.discount-badge');

  //   expect(discountBadge).toBeTruthy();
  //   expect(discountBadge?.textContent).toContain('20%');
  // });
});
