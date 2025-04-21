import { Static, Type } from '@sinclair/typebox';

export const UserSetPasswordBody = Type.Object(
    {
        accountId: Type.String(),
        password: Type.String(),
        newPassword: Type.String(),
    },
    { title: 'UserSetPasswordBody' },
);
export type UserSetPasswordBody = Static<typeof UserSetPasswordBody>;
