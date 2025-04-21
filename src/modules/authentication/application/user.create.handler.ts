import {
    getAwsCognitoClient,
    IAwsCognitoClient,
} from '#app/shared/aws-cognito/aws-cognito.client.js';
import { CreateUserCommand, SetPasswordUserCommand } from '#app/shared/aws-cognito/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
/**
 * @fyi
 * this handler directly calls aws-cognito infrastructural tool
 * why: to save out a layer (repository) of abstraction
 */
type UserCreateCommand = {
    email: string;
    password: string;
    accountId: string;
    entityType: UserEntityType;
    entityId: string;
    subscriptionId: string;
};
export class UserCreateHandler {
    async execute(command: UserCreateCommand): Promise<User> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const user = new User({
            accountId: command.accountId,
            entityType: command.entityType,
            entityId: command.entityId,
            subscriptionId: command.subscriptionId,
        });
        /**
         * Create unverified user without password
         */
        const createUser = new CreateUserCommand({
            email: command.email,
            accountId: command.accountId,
            entityType: command.entityType,
            entityId: command.entityId,
            subscriptionId: command.subscriptionId,
        });
        await this.awsCognitoClient.send(createUser);
        /**
         * Set password
         */
        const setPassword = new SetPasswordUserCommand({
            accountId: command.accountId,
            password: command.password,
        });
        await this.awsCognitoClient.send(setPassword);

        l.info('success');
        return user;
    }

    private get awsCognitoClient(): IAwsCognitoClient {
        return getAwsCognitoClient();
    }

    private get l() {
        return getLogger().child({
            cls: 'UserCreateHandler',
        });
    }
}
