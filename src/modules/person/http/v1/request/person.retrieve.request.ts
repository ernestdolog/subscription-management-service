import { Static, Type } from '@sinclair/typebox';

export const PersonRetrieveParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'PersonRetrieveParams' },
);

export type PersonRetrieveParams = Static<typeof PersonRetrieveParams>;
