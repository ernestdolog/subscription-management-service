import { Static, Type } from '@sinclair/typebox';

export const SubscriptionUpdateParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'SubscriptionUpdateParams' },
);

export type SubscriptionUpdateParams = Static<typeof SubscriptionUpdateParams>;

export const SubscriptionUpdateBody = Type.Object(
    {
        name: Type.Optional(Type.String()),
    },
    { title: 'SubscriptionUpdateBody' },
);

export type SubscriptionUpdateBody = Static<typeof SubscriptionUpdateBody>;
