import { AccountEntity } from '../../../domain/index.js';
import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { SubscriptionEntity } from '#app/modules/subscription/domain/subscription.entity.js';
import { PersonResponse, toPersonResponse } from '#app/modules/person/http/v1/index.js';
import {
    SubscriptionResponse,
    toSubscriptionResponse,
} from '#app/modules/subscription/http/v1/index.js';

export const AccountRetrieveResponse = Type.Composite(
    [
        Type.Object(
            {
                id: Type.String(),
                entityType: Type.Literal(UserEntityType.PERSON),
                entityId: Type.String(),
                person: PersonResponse,
                isActive: Type.Boolean(),
                subscription: SubscriptionResponse,
                createdAt: Type.String({ format: 'date-time', default: null }),
                createdBy: Type.String(),
                updatedAt: Type.String({ format: 'date-time', default: null }),
                updatedBy: Type.String(),
            },
            { additionalProperties: false },
        ),
    ],
    { title: 'AccountRetrieve' },
);

export type AccountRetrieveResponse = Static<typeof AccountRetrieveResponse>;

export const toAccountRetrieveResponse = (
    account: AccountEntity,
    subscription: SubscriptionEntity,
) =>
    Value.Convert(AccountRetrieveResponse, {
        id: account.id,
        entityType: account.entityType,
        entityId: account.entityId,
        person: toPersonResponse(account.entity!),
        isActive: account.isActive(),
        subscription: toSubscriptionResponse(subscription),
        createdAt: account.createdAt.toString(),
        createdBy: account.createdBy,
        updatedAt: account.updatedAt.toString(),
        updatedBy: account.updatedBy,
    }) as AccountRetrieveResponse;
