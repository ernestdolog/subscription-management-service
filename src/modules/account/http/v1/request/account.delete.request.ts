import { Static, Type } from '@sinclair/typebox';

export const AccountDeleteParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'AccountDeleteParams' },
);

export type AccountDeleteParams = Static<typeof AccountDeleteParams>;
