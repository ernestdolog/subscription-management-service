import { Static, Type } from '@sinclair/typebox';

export const AccountRetrieveParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'AccountRetrieveParams' },
);

export type AccountRetrieveParams = Static<typeof AccountRetrieveParams>;
