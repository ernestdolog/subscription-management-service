import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import { Static, Type } from '@sinclair/typebox';

export const UserResponse = Type.Object(
    {
        accountId: Type.String(),
        entityType: Type.Enum(UserEntityType, { enum: Object.keys(UserEntityType) }),
        entityId: Type.String(),
        subscriptionId: Type.String(),
    },
    { additionalProperties: false, title: 'User' },
);

export type UserResponse = Static<typeof UserResponse>;
