import { Static, Type } from '@sinclair/typebox';
import { EventEntityType, EventType } from '#app/shared/kafka/events/kafka.event.enum.js';

export const AbstractEventDto = Type.Object(
    {
        type: Type.Enum(EventType, { enum: Object.keys(EventType) }),
        entityType: Type.Enum(EventEntityType, { enum: Object.keys(EventEntityType) }),
        entityId: Type.String(),
    },
    { additionalProperties: true },
);

export type AbstractEventDto = Static<typeof AbstractEventDto>;
