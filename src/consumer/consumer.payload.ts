import { EachMessagePayload } from 'kafkajs';
import { events } from '#app/shared/kafka/index.js';
import { AbstractKafkaEvent } from '#app/shared/kafka/events/abstract.kafka.event.js';
import { Topic } from '#app/shared/kafka/events/kafka.event.enum.js';
import { SubscriptionCreatedEventHandler } from '#app/modules/subscription/application/subscription.created.event-handler.js';
import { SubscriptionUpdatedEventHandler } from '#app/modules/subscription/application/subscription.updated.event-handler.js';
import {
    AbstractTransactionManager,
    TypeOrmTransactionManager,
} from '#app/shared/transaction/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractKafkaEventDto } from '#app/shared/kafka/events/kafka.event.dto.js';

export class ConsumerPayload {
    private manager: AbstractTransactionManager;
    constructor(private readonly payload: EachMessagePayload) {
        this.manager = new TypeOrmTransactionManager();
    }

    get data() {
        return JSON.parse(Buffer.from(this.payload.message.value ?? '').toString('utf8'));
    }

    get event(): AbstractKafkaEvent | undefined {
        switch (this.payload.topic) {
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE:
                return new events.v1.SubscriptionsSubscriptionCreatedEvent(this.data);
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE:
                return new events.v1.SubscriptionsSubscriptionUpdatedEvent(this.data);
            default:
                return;
        }
    }

    get handler():
        | AbstractService<
              AbstractKafkaEvent<AbstractKafkaEventDto, Record<string, string>>,
              unknown | undefined
          >
        | undefined {
        switch (this.payload.topic) {
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE:
                return new SubscriptionCreatedEventHandler(this.manager);
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE:
                return new SubscriptionUpdatedEventHandler(this.manager);
            default:
                return;
        }
    }
}
