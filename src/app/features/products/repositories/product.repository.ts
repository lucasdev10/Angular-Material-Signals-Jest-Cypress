import { inject, Injectable } from '@angular/core';
import { HttpService } from '@app/core/http/http';
import { IRepository } from '@app/shared/interfaces/repository.interface';
import { DateUtils } from '@app/shared/utils/date.utils';
import { Observable } from 'rxjs';
import { ICreateProductDto, IProduct, IUpdateProductDto } from '../models/product.model';

/**
 * Repository Pattern para Products
 * Abstrai a camada de dados, facilitando troca futura para API real
 */
@Injectable({
  providedIn: 'root',
})
export class ProductRepository implements IRepository<
  IProduct,
  ICreateProductDto,
  IUpdateProductDto
> {
  private readonly http = inject(HttpService);
  private readonly COLLECTION_KEY = 'products';

  /**
   * Busca todos os produtos
   */
  findAll(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.COLLECTION_KEY);
  }

  /**
   * Busca produto por ID
   */
  findById(id: string): Observable<IProduct> {
    return this.http.getById<IProduct>(this.COLLECTION_KEY, id);
  }

  /**
   * Cria novo produto
   */
  create(dto: ICreateProductDto): Observable<IProduct> {
    const product: Partial<IProduct> = {
      ...dto,
      image: dto.image || '/assets/images/coffee.jpg',
      rating: 0,
      createdAt: DateUtils.now(),
      updatedAt: DateUtils.now(),
    };

    return this.http.post<IProduct>(this.COLLECTION_KEY, product as IProduct);
  }

  /**
   * Atualiza produto existente
   */
  update(id: string, dto: IUpdateProductDto): Observable<IProduct> {
    const updateData: Partial<IProduct> = {
      ...dto,
      updatedAt: DateUtils.now(),
    };

    return this.http.put<IProduct>(this.COLLECTION_KEY, id, updateData as IProduct);
  }

  /**
   * Remove produto
   */
  delete(id: string): Observable<void> {
    return this.http.delete(this.COLLECTION_KEY, id);
  }
}
