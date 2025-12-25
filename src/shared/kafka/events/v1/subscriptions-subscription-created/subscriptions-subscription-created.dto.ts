import { Static, Type } from '@sinclair/typebox';
import { AbstractKafkaEventDto } from '#app/shared/kafka/events/kafka.event.dto.js';
import { EventEntityType, EventType } from '../../kafka.event.enum.js';

export const SubscriptionsSubscriptionCreatedDto = Type.Composite([
    AbstractKafkaEventDto,
    Type.Object(
        {
            type: Type.Literal(EventType.CREATE),
            entityType: Type.Literal(EventEntityType.SUBSCRIPTION),
            name: Type.String(),
            createdAt: Type.String(),
            createdBy: Type.Optional(Type.String()),
            updatedAt: Type.String(),
            updatedBy: Type.Optional(Type.String()),
        },
        { additionalProperties: false },
    ),
]);

export type SubscriptionsSubscriptionCreatedDto = Static<
    typeof SubscriptionsSubscriptionCreatedDto
>;
