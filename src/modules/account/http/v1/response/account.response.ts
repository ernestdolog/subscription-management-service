import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { AccountEntity } from '../../../domain/index.js';
import { PersonResponse, toPersonResponse } from '#app/modules/person/http/v1/index.js';

export const AccountResponse = Type.Composite(
    [
        Type.Object(
            {
                id: Type.String(),
                entityType: Type.Literal(UserEntityType.PERSON),
                entityId: Type.String(),
                person: PersonResponse,
                isActive: Type.Boolean(),
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

export type AccountResponse = Static<typeof AccountResponse>;

export const toAccountResponse = (account: AccountEntity) =>
    Value.Convert(AccountResponse, {
        id: account.id,
        entityType: account.entityType,
        entityId: account.entityId,
        person: toPersonResponse(account.entity!),
        isActive:
            account.invitations?.length &&
            !account.invitations.find(invitation => invitation.isValid === true),
        createdAt: account.createdAt.toString(),
        createdBy: account.createdBy,
        updatedAt: account.updatedAt.toString(),
        updatedBy: account.updatedBy,
    }) as AccountResponse;
