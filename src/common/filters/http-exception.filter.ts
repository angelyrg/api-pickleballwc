import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message || exception.message;

    this.loggerService.log({
      error: errorMessage,
      path: 'src/common/filters/http-exception.filter.ts',
      function: 'catch',
      tags: ['http', 'exception'],
      extra: {
        status,
        errorMessage,
        log: `[HttpExceptionFilter] Status: ${status} Error: ${errorMessage} Path: ${request.url} ExceptionType: ${exception?.constructor?.name}`,
      },
    });

    response.status(status).json({
      message: errorMessage,
      statusCode: status,
      // path: request.url,
      // timestamp: new Date().toISOString(),
    });
  }
}
