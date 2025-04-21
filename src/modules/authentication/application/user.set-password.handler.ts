import {
    IAwsCognitoClient,
    getAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import {
    LoginCommand,
    ChangePasswordUserCommand,
    GetUserCommand,
} from '#app/shared/aws-cognito/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { AdminGetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoUser, User } from '#app/shared/authorization/tool/index.js';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type UserSetPasswordCommand = {
    accountId: string;
    password: string;
    newPassword: string;
};
export class UserSetPasswordHandler {
    async execute(command: UserSetPasswordCommand): Promise<User> {
        const l = this.l.child({ ctx: command });
        l.info('start');
        /**
         * In the App we are using ID-Token, so can't just use the unencoded token
         * We are using for authentication
         * Need to authenticate the user, and get its AccessToken
         */
        const login = new LoginCommand({
            accountId: command.accountId,
            password: command.password,
        });

        const authenticaton = await this.awsCognitoClient.send(login);

        const changePasswordCommand = new ChangePasswordUserCommand({
            accessToken: authenticaton.AuthenticationResult!.AccessToken!,
            oldPassword: command.password,
            newPassword: command.newPassword,
        });

        await this.awsCognitoClient.send(changePasswordCommand);

        const getUserCommand = new GetUserCommand({
            accountId: command.accountId,
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
            cls: 'UserChangePasswordHandler',
        });
    }
}
