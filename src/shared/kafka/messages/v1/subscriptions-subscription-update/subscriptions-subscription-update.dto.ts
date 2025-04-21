import { Static, Type } from '@sinclair/typebox';
import { AbstractKafkaMessageDto } from '#app/shared/kafka/messages/kafka.message.dto.js';
import { EventEntityType, EventType } from '../../kafka.message.enum.js';

export const SubscriptionsSubscriptionUpdateDto = Type.Composite([
    AbstractKafkaMessageDto,
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

export type SubscriptionsSubscriptionUpdateDto = Static<typeof SubscriptionsSubscriptionUpdateDto>;
