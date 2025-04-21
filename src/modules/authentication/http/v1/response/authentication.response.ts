import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export const AuthenticationResponse = Type.Object(
    {
        token: Type.String(),
        refreshToken: Type.String(),
        expires: Type.Number(),
    },
    { additionalProperties: false, title: 'Authentication' },
);

export type AuthenticationResponse = Static<typeof AuthenticationResponse>;

export const toAuthenticationResponse = (authentication: InitiateAuthCommandOutput) =>
    Value.Convert(AuthenticationResponse, {
        token: authentication.AuthenticationResult!.IdToken!,
        refreshToken: authentication.AuthenticationResult!.RefreshToken!,
        expires: Number(authentication.AuthenticationResult!.ExpiresIn!),
    }) as AuthenticationResponse;
