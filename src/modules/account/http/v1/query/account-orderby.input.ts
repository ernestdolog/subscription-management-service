import { OrderByDirection } from '#app/shared/rest-typeorm-query/index.js';
import { Static, Type } from '@sinclair/typebox';

export const AccountOrderByInput = Type.Object(
    {
        field: Type.Union([Type.Literal('created_at'), Type.Literal('updated_at')]),
        direction: Type.Enum(OrderByDirection, { enum: Object.keys(OrderByDirection) }),
    },
    { additionalProperties: false, title: 'AccountOrderByInput' },
);
export type AccountOrderByInput = Static<typeof AccountOrderByInput>;
