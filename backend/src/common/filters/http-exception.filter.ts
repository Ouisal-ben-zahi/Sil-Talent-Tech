import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    } else if (exception.message) {
      message = exception.message;
    }

    // Log l'erreur complète pour le débogage
    console.error('❌ Erreur capturée:', {
      path: request.url,
      method: request.method,
      message: exception.message,
      stack: exception.stack,
    });

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      ...(process.env.NODE_ENV === 'development' && {
        error: exception.message,
        stack: exception.stack,
      }),
    };

    response.status(status).json(errorResponse);
  }
}



