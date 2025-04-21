import { LogEntry, logLevel } from 'kafkajs';
import { AppLogLevel, getLogger } from '#app/shared/logging/index.js';

const toAppLogLevel = (level: logLevel): AppLogLevel => {
    switch (level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
            return AppLogLevel.ERROR;
        case logLevel.WARN:
            return AppLogLevel.WARN;
        case logLevel.INFO:
            return AppLogLevel.INFO;
        case logLevel.DEBUG:
            return AppLogLevel.DEBUG;
    }
};

export const KafkaAppLogger = (level: logLevel) => {
    const appLevel = toAppLogLevel(level);
    return (entry: LogEntry) => {
        const context = {
            label: entry.label,
            level: entry.level,
            namespace: entry.namespace,
        };
        getLogger().child({ cls: 'KafkaAppLogger', ctx: context })[appLevel](entry.log.message);
    };
};
