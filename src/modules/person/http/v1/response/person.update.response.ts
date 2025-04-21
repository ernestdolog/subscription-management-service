import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { PersonEntity } from '../../../domain/person.entity.js';

export const PersonUpdateResponse = Type.Object(
    {
        id: Type.String(),
        firstName: Type.Optional(Type.String()),
        lastName: Type.Optional(Type.String()),
        createdAt: Type.String({ format: 'date-time', default: null }),
        createdBy: Type.String(),
        updatedAt: Type.String({ format: 'date-time', default: null }),
        updatedBy: Type.String(),
    },
    { additionalProperties: false, title: 'PersonUpdate' },
);

export type PersonUpdateResponse = Static<typeof PersonUpdateResponse>;

export const toPersonUpdateResponse = (person: PersonEntity) =>
    Value.Convert(PersonUpdateResponse, {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        createdAt: person.createdAt,
        createdBy: person.createdBy,
        updatedAt: person.updatedAt,
        updatedBy: person.updatedBy,
    }) as PersonUpdateResponse;
