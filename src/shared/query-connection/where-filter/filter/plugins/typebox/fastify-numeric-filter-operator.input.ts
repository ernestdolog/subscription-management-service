import { Static, Type } from '@sinclair/typebox';

export const NumericFilterOperator = Type.Object(
    {
        eq: Type.Optional(Type.Number()),
        gt: Type.Optional(Type.Number()),
        gte: Type.Optional(Type.Number()),
        lt: Type.Optional(Type.Number()),
        lte: Type.Optional(Type.Number()),
        in: Type.Optional(Type.Array(Type.Number())),
        not: Type.Optional(Type.Number()),
        notIn: Type.Optional(Type.Array(Type.Number())),
    },
    { additionalProperties: false, title: 'NumericFilterOperator' },
);
export type NumericFilterOperator = Static<typeof NumericFilterOperator>;
