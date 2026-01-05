export class DateUtil {
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static formatDateTime(date: Date): string {
    return date.toISOString();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isExpired(date: Date, expirationDays: number): boolean {
    const expirationDate = this.addDays(date, expirationDays);
    return new Date() > expirationDate;
  }
}



