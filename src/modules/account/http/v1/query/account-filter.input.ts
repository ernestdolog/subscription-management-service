import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import {
    createEqualityOperatorSchema,
    StringFilterOperator,
} from '#app/shared/rest-typeorm-query/where-filter/filter/index.js';
import { Static, Type } from '@sinclair/typebox';

export const UserEntityTypeFilterOperator = createEqualityOperatorSchema(
    Type.Enum(UserEntityType, { enum: Object.keys(UserEntityType) }),
    'UserEntityType',
);
export type UserEntityTypeFilterOperator = Static<typeof UserEntityTypeFilterOperator>;

export const AccountFilterInput = Type.Object(
    {
        id: Type.Optional(StringFilterOperator),
        entityType: Type.Optional(UserEntityTypeFilterOperator),
        entityId: Type.Optional(StringFilterOperator),
    },
    { additionalProperties: false, title: 'AccountFilterInput' },
);
export type AccountFilterInput = Static<typeof AccountFilterInput>;
