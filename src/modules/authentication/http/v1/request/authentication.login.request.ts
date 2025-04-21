import { Static, Type } from '@sinclair/typebox';

export const AuthenticationLoginRequest = Type.Object(
    {
        email: Type.String(),
        password: Type.String(),
    },
    { title: 'AuthenticationLoginRequest' },
);

export type AuthenticationLoginRequest = Static<typeof AuthenticationLoginRequest>;
