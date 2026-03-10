import { inject, Injectable } from '@angular/core';
import { HttpService } from '@app/core/http/http';
import { DateUtils } from '@app/shared';
import { Observable } from 'rxjs';
import { ICreateUserDto, IUpdateUserDto, IUser } from '../models/user.model';

/**
 * Repository Pattern para Usuários
 * Abstrai a camada de dados, facilitando troca futura para API real
 */
@Injectable({
  providedIn: 'root',
})
export class UserRepository {
  private readonly http = inject(HttpService);
  private readonly COLLECTION_KEY = 'users';

  /**
   * Busca todos os usuários
   */
  findAll(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.COLLECTION_KEY);
  }

  /**
   * Busca produto por ID
   */
  findById(id: string): Observable<IUser> {
    return this.http.getById<IUser>(this.COLLECTION_KEY, id);
  }

  /**
   * Cria novo usuário
   */
  create(dto: ICreateUserDto): Observable<IUser> {
    const user: Partial<IUser> = {
      ...dto,
      createdAt: DateUtils.now(),
      updatedAt: DateUtils.now(),
    };

    return this.http.post<IUser>(this.COLLECTION_KEY, user as IUser);
  }

  /**
   * Atualiza usuário existente
   */
  update(id: string, dto: IUpdateUserDto): Observable<IUser> {
    const updateData: Partial<IUser> = {
      ...dto,
      updatedAt: DateUtils.now(),
    };

    return this.http.put<IUser>(this.COLLECTION_KEY, id, updateData as IUser);
  }

  /**
   * Remove usuário
   */
  delete(id: string): Observable<void> {
    return this.http.delete(this.COLLECTION_KEY, id);
  }
}
