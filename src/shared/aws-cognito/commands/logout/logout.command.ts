import { appConfig } from '#app/configs/index.js';
import {
    AdminUserGlobalSignOutCommand,
    AdminUserGlobalSignOutCommandInput,
    AdminUserGlobalSignOutCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { LogoutDto } from './logout.types.js';
import { CognitoError } from '../../cognito.error.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';

export class LogoutCommand extends AbstractCommand<
    LogoutDto,
    AdminUserGlobalSignOutCommandInput,
    AdminUserGlobalSignOutCommandOutput
> {
    constructor(properties: LogoutDto) {
        super(properties);
    }

    get input(): AdminUserGlobalSignOutCommandInput {
        const accountAccessKey = this.properties.email || this.properties.accountId;
        if (!accountAccessKey) throw new InternalServerError(CognitoError.MISSING_ACCESS_KEY);
        return {
            UserPoolId: appConfig.aws.cognito.userPoolId,
            Username: accountAccessKey,
        };
    }

    compose(): AdminUserGlobalSignOutCommand {
        return new AdminUserGlobalSignOutCommand(this.input);
    }
}
