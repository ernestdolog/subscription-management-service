import { appConfig } from '#app/configs/index.js';
import {
    AuthFlowType,
    InitiateAuthCommand,
    InitiateAuthCommandInput,
    InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { RefresTokenDto } from './refresh-token.types.js';

export class RefresTokenCommand extends AbstractCommand<
    RefresTokenDto,
    InitiateAuthCommandInput,
    InitiateAuthCommandOutput
> {
    constructor(properties: RefresTokenDto) {
        super(properties);
    }

    get input(): InitiateAuthCommandInput {
        return {
            AuthParameters: {
                REFRESH_TOKEN: this.properties.refreshToken,
            },
            AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
            ClientId: appConfig.aws.cognito.clientId,
        };
    }

    compose(): InitiateAuthCommand {
        return new InitiateAuthCommand(this.input);
    }
}
// GlobalSignOutCommand
