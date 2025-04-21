import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { SubscriptionEntity } from '../../../domain/subscription.entity.js';
import {
    toAccountResponse,
    AccountResponse,
} from '#app/modules/account/http/v1/response/account.response.js';

export const SubscriptionResponse = Type.Object(
    {
        id: Type.String(),
        name: Type.String(),
        accounts: Type.Array(AccountResponse),
        createdAt: Type.String({ format: 'date-time', default: null }),
        createdBy: Type.String(),
        updatedAt: Type.String({ format: 'date-time', default: null }),
        updatedBy: Type.String(),
    },
    { additionalProperties: false, title: 'Subscription' },
);

export type SubscriptionResponse = Static<typeof SubscriptionResponse>;

export const toSubscriptionResponse = (subscription: SubscriptionEntity) =>
    Value.Convert(SubscriptionResponse, {
        id: subscription.id,
        name: subscription.name,
        accounts: subscription.accounts!.map(toAccountResponse),
        createdAt: subscription.createdAt,
        createdBy: subscription.createdBy,
        updatedAt: subscription.updatedAt,
        updatedBy: subscription.updatedBy,
    }) as SubscriptionResponse;
