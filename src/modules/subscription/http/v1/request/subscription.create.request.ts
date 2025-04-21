import { Static, Type } from '@sinclair/typebox';

export const SubscriptionCreateBody = Type.Object(
    {
        subscriptionName: Type.String(),
        firstName: Type.Union([Type.String(), Type.Null()]),
        lastName: Type.Union([Type.String(), Type.Null()]),
        email: Type.String(),
    },
    { title: 'SubscriptionCreateBody' },
);

export type SubscriptionCreateBody = Static<typeof SubscriptionCreateBody>;
