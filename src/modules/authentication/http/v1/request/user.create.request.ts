import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import { Static, Type } from '@sinclair/typebox';

export const UserRegisterRequest = Type.Object(
    {
        email: Type.String(),
        password: Type.String(),
        accountId: Type.String(),
        entityType: Type.Enum(UserEntityType, { enum: Object.keys(UserEntityType) }),
        entityId: Type.String(),
        subscriptionId: Type.String(),
    },
    { title: 'UserRegisterRequest' },
);

export type UserRegisterRequest = Static<typeof UserRegisterRequest>;
