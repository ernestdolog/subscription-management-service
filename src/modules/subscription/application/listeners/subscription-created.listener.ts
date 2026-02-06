import { Static, Type } from '@sinclair/typebox';
import { AbstractEventListener, AbstractEventDto } from '#app/shared/event-listener/index.js';
import { EventEntityType, EventType } from '#app/shared/kafka/events/kafka.event.enum.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/domain/index.js';

export const SubscriptionCreatedEvent = Type.Intersect([
    AbstractEventDto,
    Type.Object({
        subscriptionId: Type.String(),
        name: Type.String(),
        createdAt: Type.String(),
        createdBy: Type.Optional(Type.String()),
        updatedAt: Type.String(),
        updatedBy: Type.Optional(Type.String()),
    }),
]);

export type SubscriptionCreatedEvent = Static<typeof SubscriptionCreatedEvent>;

export class SubscriptionCreatedListener extends AbstractEventListener<SubscriptionCreatedEvent> {
    protected get listenerName(): string {
        return 'SubscriptionCreatedListener';
    }

    protected filter(event: AbstractEventDto): event is SubscriptionCreatedEvent {
        return event.type === EventType.CREATE && event.entityType === EventEntityType.SUBSCRIPTION;
    }

    protected async execute(event: SubscriptionCreatedEvent): Promise<void> {
        const log = this.log.child({ subscriptionId: event.subscriptionId });
        log.info('Processing subscription created event');

        const existing = await this.subscriptionRepository.getOneWithRelations(
            event.subscriptionId,
        );

        if (!existing) {
            await this.subscriptionRepository.preserveNew({
                id: event.subscriptionId,
                name: event.name,
                createdAt: new Date(event.createdAt),
                createdBy: event.createdBy,
                updatedAt: new Date(event.updatedAt),
                updatedBy: event.updatedBy,
            });

            log.info('Subscription created');
            return;
        }

        log.info('Subscription already exists');
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.transactionManager);
    }
}
