import { Static, Type } from '@sinclair/typebox';
import { EventEntityType, EventType } from './kafka.message.enum.js';

export const AbstractKafkaMessageDto = Type.Object(
    {
        type: Type.Enum(EventType, { enum: Object.keys(EventType) }),
        /**
         * Holds string of actual object's arbitrary name that this account related to. Like
         * if this event belongs to Organisation or AccountingArea
         */
        entityType: Type.Enum(EventEntityType, { enum: Object.keys(EventEntityType) }),
        /**
         * Holds string of related entity's id, usually a primary key
         */
        entityId: Type.String(),
        subscriptionId: Type.String(),
        createdAt: Type.String(),
        createdBy: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
);

export type AbstractKafkaMessageDto = Static<typeof AbstractKafkaMessageDto>;
