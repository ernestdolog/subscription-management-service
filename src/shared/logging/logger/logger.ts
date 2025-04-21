import { ILogInfo } from './logger.types.js';
import { MASKED_FIELDS, REDACTION_MASK } from './logger.constants.js';
import { getRequestId } from '../plugins/fastify/index.js';
import { appConfig } from '#app/configs/app.config.js';
import { Logger as PinoLogger, LoggerOptions } from 'pino';
import { pino } from 'pino';

class AppLogger {
    protected logger: PinoLogger;
    protected options: LoggerOptions = {
        name: process.env.npm_package_name ?? '',
        level: appConfig.logLevel ?? 'info',
        redact: {
            paths: MASKED_FIELDS,
            censor: REDACTION_MASK,
        },
    };

    constructor() {
        this.logger = pino(this.options);
    }

    getInstance(logInfo?: ILogInfo): PinoLogger {
        const bindings = logInfo ?? {};
        const requestId = getRequestId();
        if (requestId) {
            bindings.requestId = requestId;
        }
        return this.logger.child(bindings);
    }
}

let appLogger: AppLogger;

/**
 * Returns global logger object.
 *
 * @param {ILogInfo|undefined} logInfo
 * @returns PinoLogger
 */
export function getLogger(logInfo?: ILogInfo): PinoLogger {
    if (!appLogger) appLogger = new AppLogger();
    return appLogger.getInstance(logInfo);
}
