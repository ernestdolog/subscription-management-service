import { CognitoUser, User } from '#app/shared/authorization/tool/index.js';
import {
    IAwsCognitoClient,
    getAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import { GetUserCommand, InternalForgotPasswordCommand } from '#app/shared/aws-cognito/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { AdminGetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type UserSetForgotPasswordCommand = {
    email: string;
};
export class UserSetForgotPasswordHandler {
    async execute(command: UserSetForgotPasswordCommand): Promise<User> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const forgotPasswordCommand = new InternalForgotPasswordCommand({
            email: command.email,
        });

        await this.awsCognitoClient.send(forgotPasswordCommand);

        const getUserCommand = new GetUserCommand({
            email: command.email,
        });

        const getUser = await this.awsCognitoClient.send(getUserCommand);

        const attributes = this.getAttributes(getUser);

        l.info('success');
        return new CognitoUser(attributes).deserialize();
    }

    private getAttributes(user: AdminGetUserCommandOutput) {
        const attributes = user?.UserAttributes?.reduce(
            (accumulate, curr) => {
                if (!curr.Name || !curr.Value) return accumulate;
                accumulate[curr.Name] = curr.Value;
                return accumulate;
            },
            {} as Record<string, string>,
        );
        return attributes;
    }

    private get awsCognitoClient(): IAwsCognitoClient {
        return getAwsCognitoClient();
    }

    private get l() {
        return getLogger().child({
            cls: 'UserSetForgotPasswordHandler',
        });
    }
}
