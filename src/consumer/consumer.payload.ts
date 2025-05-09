import { EachMessagePayload } from 'kafkajs';
import { messages } from '#app/shared/kafka/index.js';
import { AbstractKafkaMessage } from '#app/shared/kafka/messages/abstract.kafka.message.js';
import { Topic } from '#app/shared/kafka/messages/kafka.message.enum.js';
import { SubscriptionCreateMessageHandler } from '#app/modules/subscription/application/subscription.create-message.handler.js';
import { SubscriptionUpdateMessageHandler } from '#app/modules/subscription/application/subscription.update-message.handler.js';
import {
    AbstractTransactionManager,
    TypeOrmTransactionManager,
} from '#app/shared/transaction/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractKafkaMessageDto } from '#app/shared/kafka/messages/kafka.message.dto.js';

export class ConsumerPayload {
    private manager: AbstractTransactionManager;
    constructor(private readonly payload: EachMessagePayload) {
        this.manager = new TypeOrmTransactionManager();
    }

    get data() {
        return JSON.parse(Buffer.from(this.payload.message.value ?? '').toString('utf8'));
    }

    get message(): AbstractKafkaMessage | undefined {
        switch (this.payload.topic) {
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE:
                return new messages.v1.SubscriptionsSubscriptionCreateMessage(this.data);
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE:
                return new messages.v1.SubscriptionsSubscriptionUpdateMessage(this.data);
            default:
                return;
        }
    }

    get handler():
        | AbstractService<
              AbstractKafkaMessage<AbstractKafkaMessageDto, Record<string, string>>,
              unknown | undefined
          >
        | undefined {
        switch (this.payload.topic) {
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE:
                return new SubscriptionCreateMessageHandler(this.manager);
            case Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE:
                return new SubscriptionUpdateMessageHandler(this.manager);
            default:
                return;
        }
    }
}
