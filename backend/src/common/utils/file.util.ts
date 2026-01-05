export class FileUtil {
  static validatePdfFile(file: Express.Multer.File | any): boolean {
    return file?.mimetype === 'application/pdf';
  }

  static validateFileSize(file: Express.Multer.File | any, maxSize: number): boolean {
    return file?.size <= maxSize;
  }

  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${randomString}_${timestamp}_${sanitizedName}`;
  }

  static getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }
}

