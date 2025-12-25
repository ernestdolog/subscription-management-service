import { Static, Type } from '@sinclair/typebox';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { createConnectionResponse } from '#app/shared/query-connection/index.js';
import { AccountDao } from '../../../infrastructure/account.dao.js';

/**
 * Person entity as embedded in Account list response.
 * Standalone type for this endpoint only.
 */
export const AccountListPersonNode = Type.Object(
    {
        id: Type.String(),
        firstName: Type.Union([Type.String(), Type.Null()]),
        lastName: Type.Union([Type.String(), Type.Null()]),
    },
    { additionalProperties: false, title: 'AccountListPerson' },
);
export type AccountListPersonNode = Static<typeof AccountListPersonNode>;

/**
 * Account node for PERSON entityType.
 * Entity field contains the person data.
 */
export const AccountPersonNode = Type.Object(
    {
        id: Type.String(),
        entityType: Type.Literal(UserEntityType.PERSON),
        entityId: Type.String(),
        entity: AccountListPersonNode,
        createdAt: Type.String({ format: 'date-time', default: null }),
        createdBy: Type.Union([Type.String(), Type.Null()]),
        updatedAt: Type.String({ format: 'date-time', default: null }),
        updatedBy: Type.Union([Type.String(), Type.Null()]),
    },
    { additionalProperties: false, title: 'AccountPerson' },
);
export type AccountPersonNode = Static<typeof AccountPersonNode>;

/**
 * AccountNode is a discriminated union based on entityType.
 * Currently only PERSON is supported. Future types (e.g., MACHINE) would be added here.
 */
export const AccountNode = Type.Union([AccountPersonNode], { title: 'Account' });
export type AccountNode = Static<typeof AccountNode>;

/**
 * Convert AccountDao to AccountNode for list response.
 * Person must be loaded via join for this to work.
 */
export const toAccountNode = (account: AccountDao): AccountNode => {
    if (account.entityType === UserEntityType.PERSON) {
        return {
            id: account.id,
            entityType: account.entityType,
            entityId: account.entityId,
            entity: {
                id: account.person?.id ?? account.entityId,
                firstName: account.person?.firstName ?? null,
                lastName: account.person?.lastName ?? null,
            },
            createdAt: account.createdAt.toISOString(),
            createdBy: account.createdBy ?? null,
            updatedAt: account.updatedAt.toISOString(),
            updatedBy: account.updatedBy ?? null,
        };
    }

    // Future: handle other entity types here
    // For now, this is unreachable since only PERSON exists
    throw new Error(`Unsupported entityType: ${account.entityType}`);
};

export const AccountConnectionResponse = createConnectionResponse('Account', AccountNode);
export type AccountConnectionResponse = Static<typeof AccountConnectionResponse>;
