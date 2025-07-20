import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../logger/logger.service';

interface RequestWithLogger extends Request {
  logger?: LoggerService;
}

@Injectable()
export class AttachLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: RequestWithLogger, res: Response, next: NextFunction) {
    req.logger = this.logger;
    next();
  }
}
