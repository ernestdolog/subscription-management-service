import { SubscriptionEntity } from './subscription.entity.js';
import { EventEntityType, EventType } from '#app/shared/kafka/events/kafka.event.enum.js';
import { events } from '#app/shared/kafka/index.js';

/**
 * SubscriptionEntityEventMapper
 * =============================
 * Maps SubscriptionEntity to domain events.
 * Encapsulates how the domain model represents itself in events,
 * following DDD principles.
 */
export class SubscriptionEntityEventMapper {
    static toCreatedEvent(
        entity: SubscriptionEntity,
    ): events.v1.SubscriptionsSubscriptionCreatedEvent {
        return new events.v1.SubscriptionsSubscriptionCreatedEvent({
            type: EventType.CREATE,
            entityType: EventEntityType.SUBSCRIPTION,
            entityId: entity.id,
            subscriptionId: entity.id,
            name: entity.name,
            updatedAt: entity.updatedAt.toString(),
            updatedBy: entity.updatedBy,
            createdAt: entity.createdAt.toString(),
            createdBy: entity.createdBy,
        });
    }

    static toUpdatedEvent(
        entity: SubscriptionEntity,
    ): events.v1.SubscriptionsSubscriptionUpdatedEvent {
        return new events.v1.SubscriptionsSubscriptionUpdatedEvent({
            type: EventType.UPDATE,
            entityType: EventEntityType.SUBSCRIPTION,
            entityId: entity.id,
            subscriptionId: entity.id,
            name: entity.name,
            updatedAt: entity.updatedAt.toString(),
            updatedBy: entity.updatedBy ?? 'system',
            createdAt: entity.createdAt.toString(),
            createdBy: entity.createdBy ?? 'system',
        });
    }
}
