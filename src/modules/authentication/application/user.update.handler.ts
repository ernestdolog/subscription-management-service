import {
    getAwsCognitoClient,
    IAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import { LogoutCommand, UpdateUserCommand } from '#app/shared/aws-cognito/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type UserUpdateCommand = {
    accountId: string;
    entityType: UserEntityType;
    entityId: string;
    subscriptionId: string;
    email?: string;
};
export class UserUpdateHandler {
    async execute(command: UserUpdateCommand): Promise<User> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const user = new User({
            accountId: command.accountId,
            entityType: command.entityType,
            entityId: command.entityId,
            subscriptionId: command.subscriptionId,
        });
        /**
         * Update user attributes
         */
        const updateUser = new UpdateUserCommand({
            accountId: command.accountId,
            user,
            email: command.email,
        });
        await this.awsCognitoClient.send(updateUser);
        /**
         * Invalidate Users session without invalidation its refresh token via logout
         */
        const logout = new LogoutCommand({
            accountId: command.accountId,
        });
        await this.awsCognitoClient.send(logout);

        l.info('success');
        return user;
    }

    private get awsCognitoClient(): IAwsCognitoClient {
        return getAwsCognitoClient();
    }

    private get l() {
        return getLogger().child({
            cls: 'UserUpdateHandler',
        });
    }
}
