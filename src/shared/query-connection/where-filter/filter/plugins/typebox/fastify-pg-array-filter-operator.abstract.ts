import { Static, Type } from '@sinclair/typebox';

export const PGArrayFilterOperator = Type.Object(
    {
        containsAll: Type.Optional(Type.Array(Type.String())),
        containsAny: Type.Optional(Type.Array(Type.String())),
    },
    { additionalProperties: false, title: 'PGArrayFilterOperator' },
);
export type PGArrayFilterOperator = Static<typeof PGArrayFilterOperator>;
