import { TypeCompiler } from '@sinclair/typebox/compiler';
import { AbstractKafkaMessage, MessageVersion } from '../../abstract.kafka.message.js';
import { SubscriptionsSubscriptionUpdateDto } from './subscriptions-subscription-update.dto.js';
import { Topic } from '../../kafka.message.enum.js';

export class SubscriptionsSubscriptionUpdateMessage extends AbstractKafkaMessage<
    SubscriptionsSubscriptionUpdateDto,
    never
> {
    static get TOPIC() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE;
    }

    constructor(content: SubscriptionsSubscriptionUpdateDto) {
        super(content);
    }

    get isValid(): boolean {
        const compiler = TypeCompiler.Compile(SubscriptionsSubscriptionUpdateDto);
        return compiler.Check(this.content);
    }

    get topic() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE;
    }

    get version(): MessageVersion {
        return 'v1';
    }
}
