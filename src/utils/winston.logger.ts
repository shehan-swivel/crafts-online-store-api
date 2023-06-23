import * as fs from 'fs';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

const timeFormat = 'YYYY-MM-DD, HH:mm:ss';

const winstonLogger = () => {
  /**
   * This additional permission check accounts for serverless functions that may not have write permissions.
   */
  let errorFilename = 'logs/%DATE%-error.log';
  let combinedFilename = 'logs/%DATE%-combined.log';

  fs.access('logs', fs.constants.W_OK, (err) => {
    if (err) {
      errorFilename = '/tmp/' + errorFilename;
      combinedFilename = '/tmp/' + combinedFilename;
    }
  });

  return WinstonModule.createLogger({
    transports: [
      // Create daily rotate file for errors. %DATE will be substituted with the current date.
      new transports.DailyRotateFile({
        filename: errorFilename,
        level: 'error',
        format: format.combine(format.timestamp({ format: timeFormat }), format.json()),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
      }),

      // Create daily rotate file for all the logs
      new transports.DailyRotateFile({
        filename: combinedFilename,
        format: format.combine(format.timestamp({ format: timeFormat }), format.json()),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '20d',
      }),

      // Enable console logs
      new transports.Console({
        format: format.combine(
          format.colorize({ all: true }),
          format.cli(),
          format.splat(),
          format.timestamp({ format: timeFormat }),
          format.printf((info) => {
            return `${info.timestamp} ${info.level} [${info.context}] ${info.message}`;
          }),
        ),
      }),
    ],
  });
};

export default winstonLogger;
