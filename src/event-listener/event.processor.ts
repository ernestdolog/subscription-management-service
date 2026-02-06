import { EachMessagePayload } from 'kafkajs';
import { getLogger } from '#app/shared/logging/index.js';
import { AbstractEventDto } from '#app/shared/event-listener/index.js';
import { EventListeners } from './event.listeners.js';

export interface ProcessResult {
    handled: boolean;
    retryable: boolean;
    error?: Error;
}

export class EventProcessor {
    async process(payload: EachMessagePayload): Promise<ProcessResult> {
        const log = this.log.child({
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
            key: payload.message.key?.toString(),
        });

        const data = this.parseMessage(payload);
        if (!data) {
            log.warn('Event with no data - skipping');
            return { handled: false, retryable: false };
        }

        if (!this.isValidEvent(data)) {
            log.child({ data }).warn('Invalid event structure - skipping');
            return { handled: false, retryable: false };
        }

        const event = this.normalize(data);

        log.child({
            type: event.type,
            entityType: event.entityType,
            entityId: event.entityId,
        }).info('Processing event');

        return this.dispatch(event, payload.heartbeat);
    }

    private parseMessage(payload: EachMessagePayload): Record<string, unknown> | undefined {
        try {
            const value = payload.message.value;
            if (!value) return undefined;
            return JSON.parse(Buffer.from(value).toString('utf8'));
        } catch (error) {
            this.log.child({ error }).error('Failed to parse message');
            return undefined;
        }
    }

    private isValidEvent(data: Record<string, unknown>): boolean {
        return (
            typeof data.type === 'string' &&
            typeof data.entityType === 'string' &&
            typeof data.entityId === 'string'
        );
    }

    private normalize(data: Record<string, unknown>): AbstractEventDto {
        return data as AbstractEventDto;
    }

    private async dispatch(
        event: AbstractEventDto,
        heartbeat: () => Promise<void>,
    ): Promise<ProcessResult> {
        for (const listener of EventListeners) {
            try {
                await heartbeat();

                const handled = await listener.listen(event);
                if (handled) {
                    return { handled: true, retryable: false };
                }
            } catch (error) {
                const isRetryable = this.isRetryableError(error);
                this.log
                    .child({
                        error,
                        entityType: event.entityType,
                        entityId: event.entityId,
                        retryable: isRetryable,
                    })
                    .error('Listener failed');

                return {
                    handled: false,
                    retryable: isRetryable,
                    error: error instanceof Error ? error : new Error(String(error)),
                };
            }
        }

        this.log
            .child({ entityType: event.entityType, type: event.type })
            .warn('No listener handled event');

        return { handled: false, retryable: false };
    }

    private isRetryableError(error: unknown): boolean {
        if (error instanceof Error) {
            const nonRetryablePatterns = ['VALIDATION', 'NOT_FOUND', 'INVALID', 'PARSE', 'SCHEMA'];
            return !nonRetryablePatterns.some(pattern => error.message.includes(pattern));
        }
        return true;
    }

    private get log() {
        return getLogger().child({ cls: 'EventProcessor' });
    }
}
