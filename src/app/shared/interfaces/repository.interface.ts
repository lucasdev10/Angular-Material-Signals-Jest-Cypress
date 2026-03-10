import { Result } from '@app/shared/models/result.model';
import { Observable } from 'rxjs';

/**
 * Interface base para repositórios
 * Define operações CRUD padrão
 */
export interface IRepository<T, TCreate, TUpdate> {
  /**
   * Busca todos os itens
   */
  findAll(): Observable<T[]>;

  /**
   * Busca item por ID
   */
  findById(id: string): Observable<T>;

  /**
   * Cria novo item
   */
  create(dto: TCreate): Observable<T>;

  /**
   * Atualiza item existente
   */
  update(id: string, dto: TUpdate): Observable<T>;

  /**
   * Remove item
   */
  delete(id: string): Observable<void>;
}

/**
 * Interface para repositórios com Result pattern
 * Versão mais robusta com tratamento de erros
 */
export interface IRepositoryWithResult<T, TCreate, TUpdate> {
  /**
   * Busca todos os itens
   */
  findAll(): Promise<Result<T[], Error>>;

  /**
   * Busca item por ID
   */
  findById(id: string): Promise<Result<T, Error>>;

  /**
   * Cria novo item
   */
  create(dto: TCreate): Promise<Result<T, Error>>;

  /**
   * Atualiza item existente
   */
  update(id: string, dto: TUpdate): Promise<Result<T, Error>>;

  /**
   * Remove item
   */
  delete(id: string): Promise<Result<void, Error>>;
}

/**
 * Interface para repositórios com paginação
 */
export interface IPaginatedRepository<T, TCreate, TUpdate, TFilter = unknown> extends IRepository<
  T,
  TCreate,
  TUpdate
> {
  /**
   * Busca itens com paginação
   */
  findPaginated(
    page: number,
    pageSize: number,
    filters?: TFilter,
  ): Observable<{
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;

  /**
   * Busca itens com filtros
   */
  findWithFilters(filters: TFilter): Observable<T[]>;

  /**
   * Conta total de itens
   */
  count(filters?: TFilter): Observable<number>;
}

/**
 * Interface para repositórios com busca
 */
export interface ISearchableRepository<T> {
  /**
   * Busca por texto
   */
  search(query: string, limit?: number): Observable<T[]>;

  /**
   * Busca com sugestões
   */
  suggest(query: string, limit?: number): Observable<string[]>;
}

/**
 * Interface para repositórios com cache
 */
export interface ICacheableRepository {
  /**
   * Limpa cache
   */
  clearCache(): void;

  /**
   * Invalida cache para um item específico
   */
  invalidateCache(id: string): void;

  /**
   * Verifica se item está em cache
   */
  isInCache(id: string): boolean;
}

/**
 * Interface completa para repositórios avançados
 */
export interface IAdvancedRepository<T, TCreate, TUpdate, TFilter = unknown>
  extends
    IPaginatedRepository<T, TCreate, TUpdate, TFilter>,
    ISearchableRepository<T>,
    ICacheableRepository {
  /**
   * Busca múltiplos itens por IDs
   */
  findByIds(ids: string[]): Observable<T[]>;

  /**
   * Verifica se item existe
   */
  exists(id: string): Observable<boolean>;

  /**
   * Atualização em lote
   */
  updateMany(updates: { id: string; data: Partial<TUpdate> }[]): Observable<T[]>;

  /**
   * Remoção em lote
   */
  deleteMany(ids: string[]): Observable<void>;

  /**
   * Busca com ordenação
   */
  findSorted(sortBy: keyof T, sortOrder: 'asc' | 'desc', filters?: TFilter): Observable<T[]>;
}
