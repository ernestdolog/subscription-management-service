import { Static, Type } from '@sinclair/typebox';

export const AuthenticationRefreshTokenBody = Type.Object(
    {
        refreshToken: Type.String(),
    },
    { title: 'AuthenticationRefreshTokenBody' },
);

export type AuthenticationRefreshTokenBody = Static<typeof AuthenticationRefreshTokenBody>;
