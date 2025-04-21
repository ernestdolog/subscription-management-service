import { appConfig } from '#app/configs/index.js';
import {
    AdminEnableUserCommand,
    AdminEnableUserCommandInput,
    AdminEnableUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { EnableUserDto } from './enable-user.types.js';
import { CognitoError } from '../../cognito.error.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';

export class EnableUserCommand extends AbstractCommand<
    EnableUserDto,
    AdminEnableUserCommandInput,
    AdminEnableUserCommandOutput
> {
    constructor(properties: EnableUserDto) {
        super(properties);
    }

    get input(): AdminEnableUserCommandInput {
        const accountAccessKey = this.properties.email || this.properties.accountId;
        if (!accountAccessKey) throw new InternalServerError(CognitoError.MISSING_ACCESS_KEY);
        return {
            UserPoolId: appConfig.aws.cognito.userPoolId,
            Username: accountAccessKey,
        };
    }

    compose(): AdminEnableUserCommand {
        return new AdminEnableUserCommand(this.input);
    }
}
