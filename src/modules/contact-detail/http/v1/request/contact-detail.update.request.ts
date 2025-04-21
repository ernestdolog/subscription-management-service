import { Static, Type } from '@sinclair/typebox';
import { ContactDetailTag, ContactDetailType } from '../../../domain/index.js';

export const ContactDetailUpdateParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'ContactDetailUpdateParams' },
);

export type ContactDetailUpdateParams = Static<typeof ContactDetailUpdateParams>;

export const ContactDetailUpdateBody = Type.Object(
    {
        type: Type.Optional(Type.Enum(ContactDetailType, { enum: Object.keys(ContactDetailType) })),
        detail: Type.Optional(Type.String()),
        tag: Type.Optional(Type.Enum(ContactDetailTag, { enum: Object.keys(ContactDetailTag) })),
    },
    { title: 'ContactDetailUpdateBody' },
);

export type ContactDetailUpdateBody = Static<typeof ContactDetailUpdateBody>;
