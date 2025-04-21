import { Static, Type } from '@sinclair/typebox';

export const UserForgotPasswordBody = Type.Object(
    {
        email: Type.String(),
    },
    { title: 'UserForgotPasswordBody' },
);

export type UserForgotPasswordBody = Static<typeof UserForgotPasswordBody>;
