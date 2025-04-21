import { Static, Type } from '@sinclair/typebox';

export const SubscriptionRetrieveParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'SubscriptionRetrieveParams' },
);

export type SubscriptionRetrieveParams = Static<typeof SubscriptionRetrieveParams>;
