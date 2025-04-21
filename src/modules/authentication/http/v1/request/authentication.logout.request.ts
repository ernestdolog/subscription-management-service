import { Static, Type } from '@sinclair/typebox';

export const AuthenticationLogoutBody = Type.Object(
    {
        accountId: Type.String(),
    },
    { title: 'AuthenticationLogoutBody' },
);

export type AuthenticationLogoutBody = Static<typeof AuthenticationLogoutBody>;
