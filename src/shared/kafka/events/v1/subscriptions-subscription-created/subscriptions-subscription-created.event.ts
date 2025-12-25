import { TypeCompiler } from '@sinclair/typebox/compiler';
import { AbstractKafkaEvent, EventVersion } from '../../abstract.kafka.event.js';
import { SubscriptionsSubscriptionCreatedDto } from './subscriptions-subscription-created.dto.js';
import { Topic } from '../../kafka.event.enum.js';

export class SubscriptionsSubscriptionCreatedEvent extends AbstractKafkaEvent<
    SubscriptionsSubscriptionCreatedDto,
    never
> {
    static get TOPIC() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE;
    }

    constructor(content: SubscriptionsSubscriptionCreatedDto) {
        super(content);
    }

    get isValid(): boolean {
        const compiler = TypeCompiler.Compile(SubscriptionsSubscriptionCreatedDto);
        return compiler.Check(this.content);
    }

    get topic() {
        return Topic.SUBSCRIPTIONS_SUBSCRIPTION_CREATE;
    }

    get version(): EventVersion {
        return 'v1';
    }
}
