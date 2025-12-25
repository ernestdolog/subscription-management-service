import { TypeCompiler } from '@sinclair/typebox/compiler';
import { AbstractKafkaEvent, EventVersion } from '../../abstract.kafka.event.js';
import { SubscriptionsSubscriptionUpdatedDto } from './subscriptions-subscription-updated.dto.js';
import { Topic } from '../../kafka.event.enum.js';

export class SubscriptionsSubscriptionUpdatedEvent extends AbstractKafkaEvent<
    SubscriptionsSubscriptionUpdatedDto,
    never
> {
    static get TOPIC() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE;
    }

    constructor(content: SubscriptionsSubscriptionUpdatedDto) {
        super(content);
    }

    get isValid(): boolean {
        const compiler = TypeCompiler.Compile(SubscriptionsSubscriptionUpdatedDto);
        return compiler.Check(this.content);
    }

    get topic() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_UPDATE;
    }

    get version(): EventVersion {
        return 'v1';
    }
}
