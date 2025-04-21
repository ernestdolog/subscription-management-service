import { Static, Type } from '@sinclair/typebox';

export const UserForgotPasswordConfirmationBody = Type.Object(
    {
        accountId: Type.String(),
        confirmationCode: Type.String(),
        newPassword: Type.String(),
    },
    { title: 'UserForgotPasswordConfirmationBody' },
);

export type UserForgotPasswordConfirmationBody = Static<typeof UserForgotPasswordConfirmationBody>;
