import { Static, Type } from '@sinclair/typebox';

export const PersonUpdateParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'PersonUpdateParams' },
);

export type PersonUpdateParams = Static<typeof PersonUpdateParams>;

export const PersonUpdateBody = Type.Object(
    {
        firstName: Type.Optional(Type.String()),
        lastName: Type.Optional(Type.String()),
    },
    { title: 'PersonUpdateRequest' },
);

export type PersonUpdateBody = Static<typeof PersonUpdateBody>;
