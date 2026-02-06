import { AbstractDaemon } from '#app/shared/abstract.daemon.js';
import { IAppConfig } from '#app/configs/app-config.interface.js';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { getLogger } from '#app/shared/logging/index.js';
import { getKafkaClient } from '#app/shared/kafka/client/client.js';
import { Topic } from '#app/shared/kafka/events/kafka.event.enum.js';
import { EventProcessor } from './event.processor.js';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export class EventListenerDaemon extends AbstractDaemon<IAppConfig> {
    protected consumer: Consumer;
    protected processor: EventProcessor;

    constructor(protected appConfig: IAppConfig) {
        super(appConfig);
        this.consumer = getKafkaClient().consumer({
            groupId: this.appConfig.events.kafka.consumer.groupId,
            sessionTimeout: this.appConfig.events.kafka.consumer.sessionTimeout,
            heartbeatInterval: this.appConfig.events.kafka.consumer.heartbeatInterval,
            retry: {
                initialRetryTime: 100,
                retries: 8,
                maxRetryTime: 30000,
            },
        });
        this.processor = new EventProcessor();
    }

    async boot(): Promise<void> {
        await this.consumer.connect();
        await this.consumer.subscribe({
            topics: [
                Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE,
                Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE,
            ],
            fromBeginning: true,
        });
    }

    async start(): Promise<void> {
        await this.consumer.run({
            autoCommit: false,
            eachMessage: payload => this.onEvent(payload),
        });
    }

    stop(): Promise<void> {
        return this.consumer.disconnect();
    }

    private async onEvent(payload: EachMessagePayload) {
        const log = getLogger().child({
            cls: 'EventListenerDaemon',
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
        });

        const result = await this.processWithRetry(payload, log);

        if (result.handled) {
            log.info('Event processed');
        } else {
            log.child({ error: result.error?.message }).warn('Event failed');
        }

        await this.commit(payload);
    }

    private async processWithRetry(payload: EachMessagePayload, log: ReturnType<typeof getLogger>) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            await payload.heartbeat();
            const result = await this.processor.process(payload);

            if (result.handled || !result.retryable) {
                return result;
            }

            if (attempt < MAX_RETRIES) {
                const delay = this.backoff(attempt);
                log.child({ attempt, delay }).warn('Retrying');
                await new Promise(r => setTimeout(r, delay));
            }
        }

        return { handled: false, retryable: false };
    }

    private backoff(attempt: number): number {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        return Math.min(delay + Math.random() * delay * 0.3, 30000);
    }

    private async commit(payload: EachMessagePayload): Promise<void> {
        await this.consumer.commitOffsets([
            {
                topic: payload.topic,
                partition: payload.partition,
                offset: (Number(payload.message.offset) + 1).toString(),
            },
        ]);
        await payload.heartbeat();
    }
}
