import { PersonEntityRelationType } from './person-entity-relation.enum.js';

export class PersonEntityRelationEntity<
    EntityType extends PersonEntityRelationType = PersonEntityRelationType.SUBSCRIPTION,
> {
    constructor(
        public id: string,
        public personId: string,
        public entityType: EntityType,
        public entityId: string,
        public createdAt: Date,
        public createdBy?: string,
        public updatedAt?: Date,
        public updatedBy?: string,
        public deletedBy?: string | null,
        public deletedAt?: Date | null,
    ) {}
}
