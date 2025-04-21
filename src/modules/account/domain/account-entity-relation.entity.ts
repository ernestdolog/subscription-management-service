import { AccountEntityRelationType } from './account-entity-relation.enum.js';

export class AccountEntityRelationEntity<
    EntityType extends AccountEntityRelationType = AccountEntityRelationType.SUBSCRIPTION,
> {
    constructor(
        public id: string,
        public accountId: string,
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
