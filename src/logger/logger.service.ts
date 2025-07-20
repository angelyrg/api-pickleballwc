import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface LogData {
  error: any;
  path?: string;
  function?: string;
  tags?: string[];
  extra?: Record<string, any>;
  level?: string;
}

@Injectable()
export class LoggerService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: LogData): Promise<void> {
    const {
      error,
      path,
      function: funcName,
      tags,
      extra,
      level = 'ERROR',
    } = data;

    let message = 'Unknown error';
    let stack = null;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        message = 'Could not stringify error object';
      }
    }

    try {
      await this.prisma.log.create({
        data: {
          level,
          message,
          stack,
          path,
          function: funcName,
          tags: tags ? (tags as Prisma.JsonArray) : Prisma.JsonNull,
          extra: extra ? (extra as Prisma.JsonObject) : Prisma.JsonNull,
        },
      });
      console.error(`[${level}] ${new Date().toISOString()} - ${message}`, {
        path,
        function: funcName,
        tags,
        extra,
        stack,
      });
    } catch (dbError) {
      console.error('FATAL: Could not write log to database.', {
        originalError: message,
        dbWriteError: dbError,
      });
    }
  }
}
