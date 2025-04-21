import { Static, Type } from '@sinclair/typebox';

export const TServerError = Type.Object({
    type: Type.Literal('InternalServerError'),
    name: Type.String(),
    code: Type.String(),
    properties: Type.Record(Type.String(), Type.Unknown()),
    message: Type.String(),
});

export type TServerError = Static<typeof TServerError>;
