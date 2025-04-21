import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import {
    toContactDetailResponse,
    ContactDetailResponse,
} from '#app/modules/contact-detail/http/v1/index.js';
import { PersonEntity } from '../../../domain/person.entity.js';

export const PersonResponse = Type.Object(
    {
        id: Type.String(),
        contactDetails: Type.Array(ContactDetailResponse),
        firstName: Type.Optional(Type.String()),
        lastName: Type.Optional(Type.String()),
        createdAt: Type.String({ format: 'date-time', default: null }),
        createdBy: Type.String(),
        updatedAt: Type.String({ format: 'date-time', default: null }),
        updatedBy: Type.String(),
    },
    { additionalProperties: false, title: 'Person' },
);

export type PersonResponse = Static<typeof PersonResponse>;

export const toPersonResponse = (person: PersonEntity) =>
    Value.Convert(PersonResponse, {
        id: person.id,
        contactDetails: person.contactDetails.map(toContactDetailResponse),
        firstName: person.firstName,
        lastName: person.lastName,
        createdAt: person.createdAt,
        createdBy: person.createdBy,
        updatedAt: person.updatedAt,
        updatedBy: person.updatedBy,
    }) as PersonResponse;
