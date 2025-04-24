import { Static, Type } from '@sinclair/typebox';

export const DateFilterOperator = Type.Object(
    {
        eq: Type.Optional(Type.String()),
        lt: Type.Optional(Type.Number()),
        lte: Type.Optional(Type.Number()),
        gt: Type.Optional(Type.Number()),
        gte: Type.Optional(Type.Number()),
        not: Type.Optional(Type.Number()),
        notIn: Type.Optional(Type.Array(Type.Number())),
    },
    { additionalProperties: false, title: 'DateFilterOperator' },
);
export type DateFilterOperator = Static<typeof DateFilterOperator>;
