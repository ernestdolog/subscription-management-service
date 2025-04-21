import { ContactDetailEntityRelationType } from './contact-detail-entity-relation.enum.js';

export class ContactDetailEntityRelationEntity {
    constructor(
        public id: string,
        public contactDetailId: string,
        public entityType: ContactDetailEntityRelationType,
        public entityId: string,
        public createdAt: Date,
        public createdBy: string,
        public updatedAt: Date,
        public updatedBy: string,
        public deletedBy?: string | null,
        public deletedAt?: Date | null,
    ) {}
}
