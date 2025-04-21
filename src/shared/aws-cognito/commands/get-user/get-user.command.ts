import { appConfig } from '#app/configs/index.js';
import {
    AdminGetUserCommand,
    AdminGetUserCommandInput,
    AdminGetUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { GetUserDto } from './get-user.types.js';
import { CognitoError } from '../../cognito.error.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';

export class GetUserCommand extends AbstractCommand<
    GetUserDto,
    AdminGetUserCommandInput,
    AdminGetUserCommandOutput
> {
    constructor(properties: GetUserDto) {
        super(properties);
    }

    get input(): AdminGetUserCommandInput {
        const accountAccessKey = this.properties.email || this.properties.accountId;
        if (!accountAccessKey) throw new InternalServerError(CognitoError.MISSING_ACCESS_KEY);
        return {
            UserPoolId: appConfig.aws.cognito.userPoolId,
            Username: accountAccessKey,
        };
    }

    compose(): AdminGetUserCommand {
        return new AdminGetUserCommand(this.input);
    }
}
