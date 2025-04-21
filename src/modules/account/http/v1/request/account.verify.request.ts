import { Static, Type } from '@sinclair/typebox';

export const AccountVerifyBody = Type.Object(
    {
        password: Type.String(),
        token: Type.String(),
    },
    { title: 'AccountVerifyBody' },
);

export type AccountVerifyBody = Static<typeof AccountVerifyBody>;
