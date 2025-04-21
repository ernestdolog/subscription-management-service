import { Static, Type } from '@sinclair/typebox';

export const UserDeleteRequest = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'UserDeleteRequest' },
);

export type UserDeleteRequest = Static<typeof UserDeleteRequest>;
