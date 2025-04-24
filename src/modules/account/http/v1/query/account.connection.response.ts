import { Static, Type } from '@sinclair/typebox';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { createConnectionResponse } from '#app/shared/rest-typeorm-query/index.js';

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

export const AccountConnectionResponse = createConnectionResponse('Account', AccountNode);
export type AccountConnectionResponse = Static<typeof AccountConnectionResponse>;
