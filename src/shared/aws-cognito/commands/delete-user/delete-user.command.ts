import { appConfig } from '#app/configs/index.js';
import {
    AdminDeleteUserCommand,
    AdminDeleteUserCommandInput,
    AdminDeleteUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { DeleteUserDto } from './delete-user.types.js';
import { CognitoError } from '../../cognito.error.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';

export class DeleteUserCommand extends AbstractCommand<
    DeleteUserDto,
    AdminDeleteUserCommandInput,
    AdminDeleteUserCommandOutput
> {
    constructor(properties: DeleteUserDto) {
        super(properties);
    }

    get input(): AdminDeleteUserCommandInput {
        const accountAccessKey = this.properties.email || this.properties.accountId;
        if (!accountAccessKey) throw new InternalServerError(CognitoError.MISSING_ACCESS_KEY);
        const commandInput = {
            UserPoolId: appConfig.aws.cognito.userPoolId,
            Username: accountAccessKey,
            ClientId: appConfig.aws.cognito.clientId,
        };
        return commandInput;
    }

    compose(): AdminDeleteUserCommand {
        return new AdminDeleteUserCommand(this.input);
    }
}
