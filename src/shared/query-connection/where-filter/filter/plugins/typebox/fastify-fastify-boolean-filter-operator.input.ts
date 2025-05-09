import { Static, Type } from '@sinclair/typebox';

export const BooleanFilterOperator = Type.Object(
    {
        eq: Type.Optional(Type.Boolean()),
        notIn: Type.Optional(Type.Array(Type.Boolean())),
        not: Type.Optional(Type.Boolean()),
    },
    { additionalProperties: false, title: 'BooleanFilterOperator' },
);
export type BooleanFilterOperator = Static<typeof BooleanFilterOperator>;
