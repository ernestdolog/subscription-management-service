import { Static, Type } from '@sinclair/typebox';

export const DateFilterOperatorISO = Type.Object(
    {
        eq: Type.Optional(Type.String()),
        lt: Type.Optional(Type.String()),
        lte: Type.Optional(Type.String()),
        gt: Type.Optional(Type.String()),
        gte: Type.Optional(Type.String()),
        not: Type.Optional(Type.String()),
        notIn: Type.Optional(Type.Array(Type.String())),
    },
    { additionalProperties: false, title: 'DateFilterOperatorISO' },
);
export type DateFilterOperatorISO = Static<typeof DateFilterOperatorISO>;
