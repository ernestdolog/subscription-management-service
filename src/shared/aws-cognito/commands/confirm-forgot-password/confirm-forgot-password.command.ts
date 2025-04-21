import { appConfig } from '#app/configs/index.js';
import {
    ConfirmForgotPasswordCommand,
    ConfirmForgotPasswordCommandInput,
    ConfirmForgotPasswordCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { ConfirmForgotPasswordDto } from './confirm-forgot-password.types.js';

export class InternalConfirmForgotPasswordCommand extends AbstractCommand<
    ConfirmForgotPasswordDto,
    ConfirmForgotPasswordCommandInput,
    ConfirmForgotPasswordCommandOutput
> {
    constructor(properties: ConfirmForgotPasswordDto) {
        super(properties);
    }

    get input(): ConfirmForgotPasswordCommandInput {
        return {
            ClientId: appConfig.aws.cognito.clientId,
            Username: this.properties.accountId,
            ConfirmationCode: this.properties.confirmationCode,
            Password: this.properties.newPassword,
        };
    }

    compose(): ConfirmForgotPasswordCommand {
        return new ConfirmForgotPasswordCommand(this.input);
    }
}
