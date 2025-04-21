import { appConfig } from '#app/configs/index.js';
import {
    AdminDisableUserCommand,
    AdminDisableUserCommandInput,
    AdminDisableUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { DisableUserDto } from './disable-user.types.js';
import { CognitoError } from '../../cognito.error.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';

export class DisableUserCommand extends AbstractCommand<
    DisableUserDto,
    AdminDisableUserCommandInput,
    AdminDisableUserCommandOutput
> {
    constructor(properties: DisableUserDto) {
        super(properties);
    }

    get input(): AdminDisableUserCommandInput {
        const accountAccessKey = this.properties.email || this.properties.accountId;
        if (!accountAccessKey) throw new InternalServerError(CognitoError.MISSING_ACCESS_KEY);
        const commandInput = {
            UserPoolId: appConfig.aws.cognito.userPoolId,
            Username: accountAccessKey,
            ClientId: appConfig.aws.cognito.clientId,
        };
        return commandInput;
    }

    compose(): AdminDisableUserCommand {
        return new AdminDisableUserCommand(this.input);
    }
}
