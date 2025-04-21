import { Static, Type } from '@sinclair/typebox';

export const AccountUpdateMeBody = Type.Object(
    {
        firstName: Type.Optional(Type.String()),
        lastName: Type.Optional(Type.String()),
    },
    { title: 'AccountUpdateMeBody' },
);

export type AccountUpdateMeBody = Static<typeof AccountUpdateMeBody>;
