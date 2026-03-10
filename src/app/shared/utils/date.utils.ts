import { format, formatDistanceToNow, getUnixTime, parseISO } from 'date-fns';

/**
 * Utilitários para manipulação de datas
 * Substitui moment.js por date-fns para melhor performance e menor bundle size
 */
export class DateUtils {
  /**
   * Converte data para timestamp Unix
   */
  static toUnixTime(date?: Date | string | number): number {
    if (!date) {
      return getUnixTime(new Date());
    }

    if (typeof date === 'string') {
      return getUnixTime(parseISO(date));
    }

    if (typeof date === 'number') {
      return date; // Já é timestamp
    }

    return getUnixTime(date);
  }

  /**
   * Cria timestamp Unix da data atual
   */
  static now(): number {
    return getUnixTime(new Date());
  }

  /**
   * Cria timestamp Unix de uma data específica
   */
  static fromDate(year: number, month: number, day: number): number {
    return getUnixTime(new Date(year, month - 1, day)); // month is 0-indexed
  }

  /**
   * Converte timestamp Unix para Date
   */
  static fromUnixTime(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  /**
   * Formata data para string
   */
  static format(date: Date | number, formatString = 'yyyy-MM-dd'): string {
    const dateObj = typeof date === 'number' ? DateUtils.fromUnixTime(date) : date;
    return format(dateObj, formatString);
  }

  /**
   * Retorna tempo relativo (ex: "2 hours ago")
   */
  static timeAgo(date: Date | number): string {
    const dateObj = typeof date === 'number' ? DateUtils.fromUnixTime(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  /**
   * Verifica se uma data é válida
   */
  static isValid(date: unknown): boolean {
    if (!date) return false;

    // Se já é um objeto Date, verifica se é válido
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }

    // Se é string, verifica formato e validade
    if (typeof date === 'string') {
      const regexDateValid =
        /^(?:\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))(?:T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\.\d{3}Z)?$/;

      if (!regexDateValid.test(date)) return false;

      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    }

    // Se é número, verifica se é um timestamp válido (deve ser maior que 0 e razoável)
    if (typeof date === 'number') {
      // Timestamps válidos devem estar em uma faixa razoável
      // Considerando que timestamps menores que 1970 (ano 0 Unix) não são válidos
      // E timestamps muito pequenos (< 1000000) provavelmente não são timestamps reais
      const minTimestamp = 1000000; // ~11 dias após 1970, mais realista
      const maxTimestamp = 4102444800; // 1º de janeiro de 2100 em segundos Unix
      const maxTimestampMs = maxTimestamp * 1000; // Em milissegundos

      // Verifica se está em uma faixa razoável (segundos ou milissegundos)
      const isValidRange = date >= minTimestamp && date <= maxTimestampMs;

      if (!isValidRange) return false;

      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    }

    // Para outros tipos, retorna false
    return false;
  }
}
