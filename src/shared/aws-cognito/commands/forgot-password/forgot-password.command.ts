import { appConfig } from '#app/configs/index.js';
import {
    ForgotPasswordCommand,
    ForgotPasswordCommandInput,
    ForgotPasswordCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { ForgotPasswordDto } from './forgot-password.types.js';

export class InternalForgotPasswordCommand extends AbstractCommand<
    ForgotPasswordDto,
    ForgotPasswordCommandInput,
    ForgotPasswordCommandOutput
> {
    constructor(properties: ForgotPasswordDto) {
        super(properties);
    }

    get input(): ForgotPasswordCommandInput {
        return {
            ClientId: appConfig.aws.cognito.clientId,
            Username: this.properties.email,
        };
    }

    compose(): ForgotPasswordCommand {
        return new ForgotPasswordCommand(this.input);
    }
}
