import {
    ChangePasswordCommand,
    ChangePasswordCommandInput,
    ChangePasswordCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { ChangePasswordUserDto } from './change-password-user.types.js';

export class ChangePasswordUserCommand extends AbstractCommand<
    ChangePasswordUserDto,
    ChangePasswordCommandInput,
    ChangePasswordCommandOutput
> {
    constructor(properties: ChangePasswordUserDto) {
        super(properties);
    }

    get input(): ChangePasswordCommandInput {
        return {
            PreviousPassword: this.properties.oldPassword,
            ProposedPassword: this.properties.newPassword,
            AccessToken: this.properties.accessToken,
        };
    }

    compose(): ChangePasswordCommand {
        return new ChangePasswordCommand(this.input);
    }
}
