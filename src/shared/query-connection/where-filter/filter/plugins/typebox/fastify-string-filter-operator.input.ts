import { Static, Type } from '@sinclair/typebox';

export const StringFilterOperator = Type.Object(
    {
        eq: Type.Optional(Type.String()),
        contains: Type.Optional(Type.String()),
        startsWith: Type.Optional(Type.String()),
        endsWith: Type.Optional(Type.String()),
        in: Type.Optional(Type.Array(Type.String())),
        notIn: Type.Optional(Type.Array(Type.String())),
        not: Type.Optional(Type.String()),
    },
    { additionalProperties: false, title: 'StringFilterOperator' },
);
export type StringFilterOperator = Static<typeof StringFilterOperator>;
