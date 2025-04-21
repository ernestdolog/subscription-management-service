import { appConfig } from '#app/configs/index.js';
import {
    AdminSetUserPasswordCommand,
    AdminSetUserPasswordCommandInput,
    AdminSetUserPasswordCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { SetPasswordUserDto } from './set-password-user.types.js';

export class SetPasswordUserCommand extends AbstractCommand<
    SetPasswordUserDto,
    AdminSetUserPasswordCommandInput,
    AdminSetUserPasswordCommandOutput
> {
    constructor(properties: SetPasswordUserDto) {
        super(properties);
    }

    get input(): AdminSetUserPasswordCommandInput {
        return {
            UserPoolId: appConfig.aws.cognito.userPoolId,
            Username: this.properties.accountId,
            Password: this.properties.password,
            Permanent: true,
        };
    }

    compose(): AdminSetUserPasswordCommand {
        return new AdminSetUserPasswordCommand(this.input);
    }
}
