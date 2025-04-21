import { CognitoUser, User } from '#app/shared/authorization/tool/index.js';
import {
    IAwsCognitoClient,
    getAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import { DeleteUserCommand, GetUserCommand } from '#app/shared/aws-cognito/commands/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { AdminGetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type UserDeleteCommand = {
    accountId: string;
    user: User;
};
export class UserDeleteHandler {
    async execute(command: UserDeleteCommand): Promise<User> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const getUserCommand = new GetUserCommand({
            accountId: command.accountId,
        });
        const getUser = await this.awsCognitoClient.send(getUserCommand);

        const currentUser = command.user;

        const attributes = this.getAttributes(getUser);
        const toBeDeletedUser = new CognitoUser(attributes).deserialize();

        if (toBeDeletedUser.subscriptionId !== currentUser.subscriptionId) {
            throw new InternalServerError(CommonError.FORBIDDEN);
        }

        const deleteUserCommand = new DeleteUserCommand({
            accountId: toBeDeletedUser.accountId,
        });
        await this.awsCognitoClient.send(deleteUserCommand);

        l.info('success');
        return toBeDeletedUser;
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
            cls: 'UserDeleteHandler',
        });
    }
}
