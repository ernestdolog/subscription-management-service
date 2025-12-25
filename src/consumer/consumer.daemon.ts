import { AbstractDaemon } from '#app/shared/abstract.daemon.js';
import { IAppConfig } from '#app/configs/app-config.interface.js';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { getLogger } from '#app/shared/logging/index.js';
import { getKafkaClient } from '#app/shared/kafka/client/client.js';
import { Topic } from '#app/shared/kafka/events/kafka.event.enum.js';
import { ConsumerPayload } from './consumer.payload.js';

export class ConsumerDaemon extends AbstractDaemon<IAppConfig> {
    protected consumer: Consumer;

    constructor(protected appConfig: IAppConfig) {
        super(appConfig);
        this.consumer = getKafkaClient().consumer({
            groupId: this.appConfig.events.kafka.consumer.groupId,
            sessionTimeout: this.appConfig.events.kafka.consumer.sessionTimeout,
            heartbeatInterval: this.appConfig.events.kafka.consumer.heartbeatInterval,
            retry: {
                initialRetryTime: 100,
                retries: 0,
            },
        });
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
        const consumerPayload = new ConsumerPayload(payload);

        const l = getLogger().child({
            cls: 'ConsumerDaemon',
            fn: 'onEvent',
            ctx: {
                topic: payload.topic,
                partition: payload.partition,
                value: consumerPayload.data,
                offset: payload.message.offset,
                event: consumerPayload.event,
            },
        });
        l.info('receive');

        if (!consumerPayload.event) return this.onUnSuccessful(l.warn('cant parse event'), payload);
        if (!consumerPayload.event.isValid)
            return this.onUnSuccessful(l.warn('invalid event'), payload);
        if (!consumerPayload.handler)
            return this.onUnSuccessful(l.warn('no handler found'), payload);

        try {
            await consumerPayload.handler.run(consumerPayload.event);
            await this.onSuccessful(l.info('success'), payload);
        } catch (error) {
            return this.onUnSuccessful(l.warn('handler not successful ', error), payload);
        }
    }

    private async onSuccessful(callback: void, payload: EachMessagePayload) {
        callback;
        await this.consumer.commitOffsets([
            {
                topic: payload.topic,
                partition: payload.partition,
                offset: (Number(payload.message.offset) + 1).toString(),
            },
        ]);
        /**
         * @fyi
         * this slows down events as long as we await the heartbeat
         * in case we need faster consumption, look here
         */
        await payload.heartbeat();
        return;
    }

    private async onUnSuccessful(callback: void, payload: EachMessagePayload) {
        callback;
        await payload.heartbeat();
        return;
    }
}
