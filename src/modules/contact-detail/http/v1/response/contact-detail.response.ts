import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import {
    ContactDetailEntity,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '../../../domain/index.js';

export const ContactDetailResponse = Type.Object(
    {
        id: Type.String(),
        entityType: Type.Enum(ContactDetailEntityType, {
            enum: Object.keys(ContactDetailEntityType),
        }),
        entityId: Type.String(),
        type: Type.Enum(ContactDetailType, { enum: Object.keys(ContactDetailType) }),
        detail: Type.String(),
        tag: Type.Enum(ContactDetailTag, { enum: Object.keys(ContactDetailTag) }),
        createdAt: Type.String({ format: 'date-time', default: null }),
        createdBy: Type.String(),
        updatedAt: Type.String({ format: 'date-time', default: null }),
        updatedBy: Type.String(),
    },
    { additionalProperties: false, title: 'ContactDetail' },
);

export type ContactDetailResponse = Static<typeof ContactDetailResponse>;

export const toContactDetailResponse = (contactDetail: ContactDetailEntity) =>
    Value.Convert(ContactDetailResponse, {
        id: contactDetail.id,
        entityType: contactDetail.entityType,
        entityId: contactDetail.entityId,
        type: contactDetail.type,
        detail: contactDetail.detail,
        tag: contactDetail.tag,
        createdAt: contactDetail.createdAt,
        createdBy: contactDetail.createdBy,
        updatedAt: contactDetail.updatedAt,
        updatedBy: contactDetail.updatedBy,
    }) as ContactDetailResponse;
