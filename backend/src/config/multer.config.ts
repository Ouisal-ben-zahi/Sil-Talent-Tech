import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { FileUtil } from '../common/utils/file.util';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: process.env.CV_UPLOAD_PATH || './cvs',
    filename: (req, file, callback) => {
      const uniqueFileName = FileUtil.generateUniqueFileName(file.originalname);
      callback(null, uniqueFileName);
    },
  }),
  fileFilter: (req, file, callback) => {
    // Vérifier le type MIME directement - Accepter PDF et Word
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error('Seuls les fichiers PDF et Word (.doc, .docx) sont acceptés'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10 Mo par défaut
  },
};

