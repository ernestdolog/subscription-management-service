import { TypeCompiler } from '@sinclair/typebox/compiler';
import { AbstractKafkaMessage, MessageVersion } from '../../abstract.kafka.message.js';
import { SubscriptionsSubscriptionCreateDto } from './subscriptions-subscription-create.dto.js';
import { Topic } from '../../kafka.message.enum.js';

export class SubscriptionsSubscriptionCreateMessage extends AbstractKafkaMessage<
    SubscriptionsSubscriptionCreateDto,
    never
> {
    static get TOPIC() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE;
    }

    constructor(content: SubscriptionsSubscriptionCreateDto) {
        super(content);
    }

    get isValid(): boolean {
        const compiler = TypeCompiler.Compile(SubscriptionsSubscriptionCreateDto);
        return compiler.Check(this.content);
    }

    get topic() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE;
    }

    get version(): MessageVersion {
        return 'v1';
    }
}
