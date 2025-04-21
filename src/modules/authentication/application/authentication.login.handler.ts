import {
    IAwsCognitoClient,
    getAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import { LoginCommand } from '#app/shared/aws-cognito/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type AuthenticationLoginCommand = {
    email: string;
    password: string;
};
export class AuthenticationLoginHandler {
    async execute(command: AuthenticationLoginCommand): Promise<InitiateAuthCommandOutput> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const login = new LoginCommand({
            email: command.email,
            password: command.password,
        });

        const authenticaton = await this.awsCognitoClient.send(login);

        l.info('success');

        return authenticaton;
    }

    private get awsCognitoClient(): IAwsCognitoClient {
        return getAwsCognitoClient();
    }

    private get l() {
        return getLogger().child({
            cls: 'AuthenticationLoginHandler',
        });
    }
}
