import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import {
    createEqualityOperatorSchema,
    StringFilterOperator,
} from '#app/shared/query-connection/where-filter/filter/index.js';
import { OrderByDirection } from '#app/shared/query-connection/index.js';
import { DEFAULT_PAGE_SIZE } from '#app/shared/query-connection/index.js';
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

export const AccountOrderByInput = Type.Object(
    {
        field: Type.Union([Type.Literal('created_at'), Type.Literal('updated_at')]),
        direction: Type.Enum(OrderByDirection, { enum: Object.keys(OrderByDirection) }),
    },
    { additionalProperties: false, title: 'AccountOrderByInput' },
);
export type AccountOrderByInput = Static<typeof AccountOrderByInput>;

export const AccountListParams = Type.Object(
    {
        filters: Type.Optional(Type.Array(AccountFilterInput)),
        orderBy: Type.Optional(AccountOrderByInput),
        first: Type.Number({ default: DEFAULT_PAGE_SIZE }),
        after: Type.Optional(Type.String()),
    },
    { additionalProperties: false, title: 'AccountListBody' },
);
export type AccountListParams = Static<typeof AccountListParams>;
