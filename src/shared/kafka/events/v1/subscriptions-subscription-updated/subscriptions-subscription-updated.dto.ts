import { Static, Type } from '@sinclair/typebox';
import { AbstractKafkaEventDto } from '#app/shared/kafka/events/kafka.event.dto.js';
import { EventEntityType, EventType } from '../../kafka.event.enum.js';

export const SubscriptionsSubscriptionUpdatedDto = Type.Composite([
    AbstractKafkaEventDto,
    Type.Object(
        {
            type: Type.Literal(EventType.UPDATE),
            entityType: Type.Literal(EventEntityType.SUBSCRIPTION),
            name: Type.String(),
            updatedAt: Type.String(),
            updatedBy: Type.String(),
        },
        { additionalProperties: false },
    ),
]);

export type SubscriptionsSubscriptionUpdatedDto = Static<
    typeof SubscriptionsSubscriptionUpdatedDto
>;
