import { appConfig } from '#app/configs/index.js';
import {
    AuthFlowType,
    InitiateAuthCommand,
    InitiateAuthCommandInput,
    InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { LoginDto } from './login.types.js';
import { CognitoError } from '../../cognito.error.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';

export class LoginCommand extends AbstractCommand<
    LoginDto,
    InitiateAuthCommandInput,
    InitiateAuthCommandOutput
> {
    constructor(properties: LoginDto) {
        super(properties);
    }

    get input(): InitiateAuthCommandInput {
        const accountAccessKey = this.properties.email || this.properties.accountId;
        if (!accountAccessKey) throw new InternalServerError(CognitoError.MISSING_ACCESS_KEY);
        return {
            AuthParameters: {
                USERNAME: accountAccessKey,
                PASSWORD: this.properties.password,
            },
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: appConfig.aws.cognito.clientId,
        };
    }

    compose(): InitiateAuthCommand {
        return new InitiateAuthCommand(this.input);
    }
}
