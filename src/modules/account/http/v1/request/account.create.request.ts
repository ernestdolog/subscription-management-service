import { Static, Type } from '@sinclair/typebox';

export const AccountCreateBody = Type.Object(
    {
        email: Type.String(),
        firstName: Type.Union([Type.String(), Type.Null()]),
        lastName: Type.Union([Type.String(), Type.Null()]),
    },
    { title: 'AccountCreateBody' },
);

export type AccountCreateBody = Static<typeof AccountCreateBody>;
