import { UserDeserializationError } from './authorization.error.js';
import { User } from './authorization.user.entity.js';
import { UserEntityType } from './authorization.user.enum.js';
import {
    ACCOUNT_ID_FIELD,
    ENTITY_ID_FIELD,
    ENTITY_TYPE_FIELD,
    SUBSCRIPTION_ID_FIELD,
} from './authorization.constants.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';

export class CognitoUser {
    constructor(private readonly externalObject: unknown) {}

    deserialize(): User {
        if (!this.externalObject || typeof this.externalObject !== 'object')
            throw new InternalServerError(UserDeserializationError.INVALID_FORMAT);
        if (!(ACCOUNT_ID_FIELD in this.externalObject))
            throw new InternalServerError(UserDeserializationError.MISSING_ACCOUNT_ID);
        if (!(ENTITY_TYPE_FIELD in this.externalObject))
            throw new InternalServerError(UserDeserializationError.MISSING_ENTITY_TYPE);
        if (!(ENTITY_ID_FIELD in this.externalObject))
            throw new InternalServerError(UserDeserializationError.MISSING_ENTITY_ID);
        if (!(SUBSCRIPTION_ID_FIELD in this.externalObject))
            throw new InternalServerError(UserDeserializationError.MISSING_SUBSCRIPTION_ID);

        const accountId = this.externalObject[ACCOUNT_ID_FIELD]?.toString();
        if (!accountId || typeof accountId !== 'string')
            throw new InternalServerError(UserDeserializationError.INVALID_ACCOUNT_ID);
        const entityType = this.externalObject[ENTITY_TYPE_FIELD] as UserEntityType;
        if (!entityType || typeof entityType !== 'string' || !UserEntityType[entityType])
            throw new InternalServerError(UserDeserializationError.INVALID_ENTITY_TYPE);
        const entityId = this.externalObject[ENTITY_ID_FIELD]?.toString();
        if (!entityId) throw new InternalServerError(UserDeserializationError.INVALID_ENTITY_ID);
        const subscriptionId = this.externalObject[SUBSCRIPTION_ID_FIELD]?.toString();
        if (!subscriptionId)
            throw new InternalServerError(UserDeserializationError.INVALID_SUBSCRIPTION_ID);

        return new User({
            accountId,
            entityType,
            entityId,
            subscriptionId,
        });
    }
}
