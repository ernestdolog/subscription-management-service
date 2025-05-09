import { Static, Type } from '@sinclair/typebox';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { createConnectionResponse } from '#app/shared/query-connection/index.js';
import { AccountEntity } from '#app/modules/account/domain/index.js';
import { Value } from '@sinclair/typebox/value';

export const AccountNode = Type.Composite(
    [
        Type.Object(
            {
                id: Type.String(),
                entityType: Type.Literal(UserEntityType.PERSON),
                entityId: Type.String(),
                createdAt: Type.String({ format: 'date-time', default: null }),
                createdBy: Type.String(),
                updatedAt: Type.String({ format: 'date-time', default: null }),
                updatedBy: Type.String(),
            },
            { additionalProperties: false },
        ),
    ],
    { title: 'Account' },
);

export type AccountNode = Static<typeof AccountNode>;

export const toAccountNode = (account: AccountEntity) =>
    Value.Convert(AccountNode, {
        id: account.id,
        entityType: account.entityType,
        entityId: account.entityId,
        createdAt: account.createdAt.toString(),
        createdBy: account.createdBy,
        updatedAt: account.updatedAt.toString(),
        updatedBy: account.updatedBy,
    }) as AccountNode;

export const AccountConnectionResponse = createConnectionResponse('Account', AccountNode);
export type AccountConnectionResponse = Static<typeof AccountConnectionResponse>;
