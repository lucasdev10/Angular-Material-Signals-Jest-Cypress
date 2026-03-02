/**
 * Utilitários para manipulação de datas
 */
export class DateUtils {
  /**
   * Formata data para string legível
   */
  static format(date: Date | string, format = 'dd/MM/yyyy'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', String(year))
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Adiciona dias a uma data
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Subtrai dias de uma data
   */
  static subtractDays(date: Date, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Verifica se uma data é hoje
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Verifica se uma data está no passado
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Verifica se uma data está no futuro
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Calcula diferença em dias entre duas datas
   */
  static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  }
}
