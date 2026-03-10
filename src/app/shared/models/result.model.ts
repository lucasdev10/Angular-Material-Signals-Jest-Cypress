/**
 * Result Pattern para melhor tratamento de erros
 * Representa o resultado de uma operação que pode falhar
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Resultado de sucesso
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
  readonly error?: never;
}

/**
 * Resultado de falha
 */
export interface Failure<E> {
  readonly success: false;
  readonly data?: never;
  readonly error: E;
}

/**
 * Helpers para criar Results
 */
export class ResultHelper {
  /**
   * Cria um resultado de sucesso
   */
  static success<T>(data: T): Success<T> {
    return { success: true, data };
  }

  /**
   * Cria um resultado de falha
   */
  static failure<E>(error: E): Failure<E> {
    return { success: false, error };
  }

  /**
   * Cria um resultado de falha com mensagem de erro
   */
  static failureWithMessage(message: string): Failure<Error> {
    return { success: false, error: new Error(message) };
  }

  /**
   * Verifica se o resultado é sucesso
   */
  static isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success === true;
  }

  /**
   * Verifica se o resultado é falha
   */
  static isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
    return result.success === false;
  }

  /**
   * Executa uma função que pode lançar exceção e retorna um Result
   */
  static try<T>(fn: () => T): Result<T, Error> {
    try {
      const data = fn();
      return ResultHelper.success(data);
    } catch (error) {
      return ResultHelper.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Executa uma função assíncrona que pode lançar exceção e retorna um Result
   */
  static async tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      const data = await fn();
      return ResultHelper.success(data);
    } catch (error) {
      return ResultHelper.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Mapeia o valor de sucesso para outro tipo
   */
  static map<T, U, E>(result: Result<T, E>, mapper: (value: T) => U): Result<U, E> {
    if (ResultHelper.isSuccess(result)) {
      return ResultHelper.success(mapper(result.data));
    }
    return result;
  }

  /**
   * Mapeia o erro para outro tipo
   */
  static mapError<T, E, F>(result: Result<T, E>, mapper: (error: E) => F): Result<T, F> {
    if (ResultHelper.isFailure(result)) {
      return ResultHelper.failure(mapper(result.error));
    }
    return result;
  }

  /**
   * Combina múltiplos Results em um único Result
   */
  static combine<T extends readonly unknown[], E>(results: {
    [K in keyof T]: Result<T[K], E>;
  }): Result<T, E> {
    const values: unknown[] = [];

    for (const result of results) {
      if (ResultHelper.isFailure(result)) {
        return result;
      }
      values.push(result.data);
    }

    return ResultHelper.success(values as unknown as T);
  }

  /**
   * Executa uma função apenas se o resultado for sucesso
   */
  static onSuccess<T, E>(result: Result<T, E>, fn: (data: T) => void): Result<T, E> {
    if (ResultHelper.isSuccess(result)) {
      fn(result.data);
    }
    return result;
  }

  /**
   * Executa uma função apenas se o resultado for falha
   */
  static onFailure<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
    if (ResultHelper.isFailure(result)) {
      fn(result.error);
    }
    return result;
  }

  /**
   * Retorna o valor de sucesso ou um valor padrão
   */
  static getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
    return ResultHelper.isSuccess(result) ? result.data : defaultValue;
  }

  /**
   * Retorna o valor de sucesso ou executa uma função para obter o valor padrão
   */
  static getOrElseGet<T, E>(result: Result<T, E>, defaultValueFn: (error: E) => T): T {
    return ResultHelper.isSuccess(result) ? result.data : defaultValueFn(result.error);
  }

  /**
   * Lança uma exceção se o resultado for falha, caso contrário retorna o valor
   */
  static unwrap<T, E>(result: Result<T, E>): T {
    if (ResultHelper.isSuccess(result)) {
      return result.data;
    }
    throw result.error;
  }

  /**
   * Converte um Result para Promise
   */
  static toPromise<T, E>(result: Result<T, E>): Promise<T> {
    return ResultHelper.isSuccess(result)
      ? Promise.resolve(result.data)
      : Promise.reject(result.error);
  }

  /**
   * Converte uma Promise para Result
   */
  static async fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
    try {
      const data = await promise;
      return ResultHelper.success(data);
    } catch (error) {
      return ResultHelper.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
