import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HTTPLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(`HTTP`);

  use(req: Request, res: Response, next: NextFunction) {
    res.on('close', () => {
      const statusCode = res.statusCode;
      const message = `HTTP request ${req.method} ${req.originalUrl} [${statusCode}]`;

      // Log error when status code is greater than or equal to 400
      if (statusCode >= 400) {
        this.logger.error(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
