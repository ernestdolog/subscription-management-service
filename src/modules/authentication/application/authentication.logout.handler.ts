import {
    IAwsCognitoClient,
    getAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import { LogoutCommand } from '#app/shared/aws-cognito/index.js';
import { getLogger } from '#app/shared/logging/index.js';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type AuthenticationLogoutCommand = {
    accountId: string;
};
export class AuthenticationLogoutHandler {
    async execute(command: AuthenticationLogoutCommand): Promise<boolean> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const logout = new LogoutCommand({
            accountId: command.accountId,
        });

        await this.awsCognitoClient.send(logout);

        l.info('success');

        return true;
    }

    private get awsCognitoClient(): IAwsCognitoClient {
        return getAwsCognitoClient();
    }

    private get l() {
        return getLogger().child({
            cls: 'AuthenticationLogoutHandler',
        });
    }
}
