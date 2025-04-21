import { appConfig } from '#app/configs/index.js';
import {
    AdminCreateUserCommand,
    AdminCreateUserCommandInput,
    AdminCreateUserCommandOutput,
    AttributeType,
    MessageActionType,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from '../abstract.command.js';
import { CreateUserDto } from './create-user.types.js';
import {
    ACCOUNT_ID_FIELD,
    ENTITY_ID_FIELD,
    ENTITY_TYPE_FIELD,
    SUBSCRIPTION_ID_FIELD,
} from '#app/shared/authorization/tool/index.js';

export class CreateUserCommand extends AbstractCommand<
    CreateUserDto,
    AdminCreateUserCommandInput,
    AdminCreateUserCommandOutput
> {
    constructor(properties: CreateUserDto) {
        super(properties);
    }

    get input(): AdminCreateUserCommandInput {
        const attibutes: AttributeType[] = [
            {
                Name: ACCOUNT_ID_FIELD,
                Value: this.properties.accountId,
            },
            {
                Name: ENTITY_TYPE_FIELD,
                Value: this.properties.entityType,
            },
            {
                Name: ENTITY_ID_FIELD,
                Value: this.properties.entityId,
            },
            {
                Name: SUBSCRIPTION_ID_FIELD,
                Value: this.properties.subscriptionId,
            },
        ];
        if (this.properties.email) {
            attibutes.push({
                Name: 'email',
                Value: this.properties.email,
            });
            attibutes.push({
                Name: 'email_verified',
                Value: 'true',
            });
        }
        return {
            UserPoolId: appConfig.aws.cognito.userPoolId,
            Username: this.properties.accountId,
            UserAttributes: attibutes,
            MessageAction: MessageActionType.SUPPRESS,
            TemporaryPassword: this.properties.temporaryPassword,
        };
    }

    compose(): AdminCreateUserCommand {
        return new AdminCreateUserCommand(this.input);
    }
}
