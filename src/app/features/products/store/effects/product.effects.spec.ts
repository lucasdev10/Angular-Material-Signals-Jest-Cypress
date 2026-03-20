import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ICreateProductDto, IProduct } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';
import { ProductActions } from '../product.actions';
import { ProductEffects } from './product.effects';

describe('ProductEffects', () => {
  let actions$: Observable<any>;
  let effects: ProductEffects;
  let repository: ProductRepository;

  let mockProducts: IProduct[] = [
    {
      id: 'product-id-1',
      name: 'Premium Coffee Beans',
      description: 'Arabica blend from Colombia with rich flavor notes',
      price: 29.99,
      image: '/assets/images/coffee.jpg',
      category: 'Food',
      stock: 50,
      rating: 4.5,
      createdAt: 1774015190,
      updatedAt: 1774015190,
    },
    {
      id: 'product-id-2',
      name: 'Espresso Machine Pro',
      description: 'Professional grade espresso maker with 15 bar pressure',
      price: 499.99,
      image: '/assets/images/coffee.jpg',
      category: 'Electronics',
      stock: 15,
      rating: 4.8,
      createdAt: 1774015190,
      updatedAt: 1774015190,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductEffects, provideMockActions(() => actions$), ProductRepository],
    });

    repository = TestBed.inject(ProductRepository);
    effects = TestBed.inject(ProductEffects);
  });

  describe('loadProducts$', () => {
    it('should return loadProductsSuccess on success', async () => {
      vi.spyOn(repository, 'findAll').mockReturnValue(of(mockProducts));
      actions$ = of(ProductActions.loadProducts());

      await vi.waitFor(() => {
        effects.loadProducts$.subscribe((action) => {
          expect(action).toEqual(ProductActions.loadProductsSuccess({ products: mockProducts }));
          expect(repository.findAll).toHaveBeenCalled();
        });
      });
    });

    it('should return loadProductsError on error', async () => {
      const error = new Error('Failed to load products');
      vi.spyOn(repository, 'findAll').mockReturnValue(throwError(() => error));
      actions$ = of(ProductActions.loadProducts());

      await vi.waitFor(() => {
        effects.loadProducts$.subscribe((action) => {
          expect(action).toEqual(ProductActions.loadProductsError({ error: error.message }));
          expect(repository.findAll).toHaveBeenCalled();
        });
      });
    });
  });

  describe('loadProductById$', () => {
    it('should return loadProductByIdSuccess on success', async () => {
      vi.spyOn(repository, 'findById').mockReturnValue(of(mockProducts[0]));
      actions$ = of(ProductActions.loadProductById({ id: mockProducts[0].id }));

      await vi.waitFor(() => {
        effects.loadProductById$.subscribe((action) => {
          expect(action).toEqual(
            ProductActions.loadProductByIdSuccess({ product: mockProducts[0] }),
          );
          expect(repository.findById).toHaveBeenCalledWith(mockProducts[0].id);
        });
      });
    });

    it('should return loadProductByIdError on error', async () => {
      const error = new Error('Failed to load product by id');
      vi.spyOn(repository, 'findById').mockReturnValue(throwError(() => error));
      actions$ = of(ProductActions.loadProductById({ id: 'invalid-id' }));

      await vi.waitFor(() => {
        effects.loadProductById$.subscribe((action) => {
          expect(action).toEqual(ProductActions.loadProductByIdError({ error: error.message }));
          expect(repository.findById).toHaveBeenCalledWith('invalid-id');
        });
      });
    });
  });

  describe('createProduct$', () => {
    it('should return createProductSuccess on success', async () => {
      const dto: ICreateProductDto = {
        name: 'New Product',
        description: 'Product description',
        price: 9.99,
        category: 'Food',
        stock: 100,
        image: '',
      };
      const newProduct: IProduct = {
        ...dto,
        id: 'created-id-1',
        rating: 0,
        createdAt: 1774015190,
        updatedAt: 1774015190,
      };

      vi.spyOn(repository, 'create').mockReturnValue(of(newProduct));
      actions$ = of(ProductActions.createProduct({ product: dto }));

      await vi.waitFor(() => {
        effects.createProduct$.subscribe((action) => {
          expect(action).toEqual(ProductActions.createProductSuccess({ product: newProduct }));
          expect(repository.create).toHaveBeenCalledWith(dto);
        });
      });
    });

    it('should return createProductError on error', async () => {
      const dto: ICreateProductDto = {
        name: 'New Product',
        description: 'Product description',
        price: 9.99,
        category: 'Food',
        stock: 100,
        image: '',
      };

      const error = new Error('Failed to create product');
      vi.spyOn(repository, 'create').mockReturnValue(throwError(() => error));
      actions$ = of(ProductActions.createProduct({ product: dto }));

      await vi.waitFor(() => {
        effects.createProduct$.subscribe((action) => {
          expect(action).toEqual(ProductActions.createProductError({ error: error.message }));
          expect(repository.create).toHaveBeenCalledWith(dto);
        });
      });
    });
  });

  describe('updateProduct$', () => {
    it('should return updateProductSuccess on success', async () => {
      const dto = { name: 'product updated' };
      const updatedProduct = { ...mockProducts[0], ...dto };

      vi.spyOn(repository, 'update').mockReturnValue(of(updatedProduct));
      actions$ = of(ProductActions.updateProduct({ id: updatedProduct.id, product: dto }));

      await vi.waitFor(() => {
        effects.updateProduct$.subscribe((action) => {
          expect(action).toEqual(ProductActions.updateProductSuccess({ product: updatedProduct }));
          expect(repository.update).toHaveBeenCalledWith(updatedProduct.id, dto);
        });
      });
    });

    it('should return updateProductError on error', async () => {
      const dto = { name: 'updated product' };
      const error = new Error('Failed to update product');
      vi.spyOn(repository, 'update').mockReturnValue(throwError(() => error));
      actions$ = of(ProductActions.updateProduct({ id: mockProducts[0].id, product: dto }));

      await vi.waitFor(() => {
        effects.updateProduct$.subscribe((action) => {
          expect(action).toEqual(ProductActions.updateProductError({ error: error.message }));
          expect(repository.update).toHaveBeenCalledWith(mockProducts[0].id, dto);
        });
      });
    });
  });

  describe('deleteProduct$', () => {
    it('should return deleteProductSuccess on success', async () => {
      vi.spyOn(repository, 'delete').mockReturnValue(of(void 0));
      actions$ = of(ProductActions.deleteProduct({ id: mockProducts[0].id }));

      await vi.waitFor(() => {
        effects.deleteProduct$.subscribe((action) => {
          expect(action).toEqual(ProductActions.deleteProductSuccess({ id: mockProducts[0].id }));
          expect(repository.delete).toHaveBeenCalledWith(mockProducts[0].id);
        });
      });
    });

    it('should return deleteProductError on error', async () => {
      const error = new Error('Failed to delete product');
      vi.spyOn(repository, 'delete').mockReturnValue(throwError(() => error));
      actions$ = of(ProductActions.deleteProduct({ id: mockProducts[0].id }));

      await vi.waitFor(() => {
        effects.deleteProduct$.subscribe((action) => {
          expect(action).toEqual(ProductActions.deleteProductError({ error: error.message }));
          expect(repository.delete).toHaveBeenCalledWith(mockProducts[0].id);
        });
      });
    });
  });
});
