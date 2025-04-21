import { appConfig } from '#app/configs/index.js';
import {
    AttributeType,
    AdminUpdateUserAttributesCommand,
    AdminUpdateUserAttributesCommandInput,
    AdminUpdateUserAttributesCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

import { AbstractCommand } from '../abstract.command.js';
import { UpdateUserDto } from './update-user.types.js';
import {
    ACCOUNT_ID_FIELD,
    ENTITY_ID_FIELD,
    ENTITY_TYPE_FIELD,
    SUBSCRIPTION_ID_FIELD,
} from '#app/shared/authorization/tool/index.js';

export class UpdateUserCommand extends AbstractCommand<
    UpdateUserDto,
    AdminUpdateUserAttributesCommandInput,
    AdminUpdateUserAttributesCommandOutput
> {
    constructor(properties: UpdateUserDto) {
        super(properties);
    }

    get input(): AdminUpdateUserAttributesCommandInput {
        const attibutes: AttributeType[] = [
            {
                Name: ACCOUNT_ID_FIELD,
                Value: this.properties.user.accountId.toString(),
            },
            {
                Name: ENTITY_TYPE_FIELD,
                Value: this.properties.user.entityType,
            },
            {
                Name: ENTITY_ID_FIELD,
                Value: this.properties.user.entityId,
            },
            {
                Name: SUBSCRIPTION_ID_FIELD,
                Value: this.properties.user.subscriptionId,
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
        };
    }

    compose(): AdminUpdateUserAttributesCommand {
        return new AdminUpdateUserAttributesCommand(this.input);
    }
}
