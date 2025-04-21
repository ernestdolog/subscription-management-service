import { Static, Type } from '@sinclair/typebox';
import { AbstractKafkaMessageDto } from '#app/shared/kafka/messages/kafka.message.dto.js';
import { EventEntityType, EventType } from '../../kafka.message.enum.js';

export const SubscriptionsSubscriptionCreateDto = Type.Composite([
    AbstractKafkaMessageDto,
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

export type SubscriptionsSubscriptionCreateDto = Static<typeof SubscriptionsSubscriptionCreateDto>;
