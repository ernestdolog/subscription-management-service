import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { SubscriptionEntity } from '../../../domain/subscription.entity.js';

export const SubscriptionUpdateResponse = Type.Object(
    {
        id: Type.String(),
        name: Type.String(),
        createdAt: Type.String({ format: 'date-time', default: null }),
        createdBy: Type.String(),
        updatedAt: Type.String({ format: 'date-time', default: null }),
        updatedBy: Type.String(),
    },
    { additionalProperties: false, title: 'SubscriptionUpdate' },
);

export type SubscriptionUpdateResponse = Static<typeof SubscriptionUpdateResponse>;

export const toSubscriptionUpdateResponse = (subscription: SubscriptionEntity) =>
    Value.Convert(SubscriptionUpdateResponse, {
        id: subscription.id,
        name: subscription.name,
        createdAt: subscription.createdAt,
        createdBy: subscription.createdBy,
        updatedAt: subscription.updatedAt,
        updatedBy: subscription.updatedBy,
    }) as SubscriptionUpdateResponse;
