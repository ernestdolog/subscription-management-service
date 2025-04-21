import {
    IAwsCognitoClient,
    getAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import { RefresTokenCommand } from '#app/shared/aws-cognito/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type AuthenticationRefreshTokenCommand = {
    refreshToken: string;
};
export class AuthenticationRefreshTokenHandler {
    async execute(command: AuthenticationRefreshTokenCommand): Promise<InitiateAuthCommandOutput> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const refreshToken = new RefresTokenCommand({
            refreshToken: command.refreshToken,
        });

        const newToken = await this.awsCognitoClient.send(refreshToken);

        if (!!newToken.AuthenticationResult && !newToken.AuthenticationResult.RefreshToken)
            newToken.AuthenticationResult.RefreshToken = command.refreshToken;

        l.info('success');

        return newToken;
    }

    private get awsCognitoClient(): IAwsCognitoClient {
        return getAwsCognitoClient();
    }

    private get l() {
        return getLogger().child({
            cls: 'AuthenticationRefreshTokenHandler',
        });
    }
}
