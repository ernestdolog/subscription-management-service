import { ContactDetailEntity } from '#app/modules/contact-detail/domain/index.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { PersonEntityRelationEntity } from './person-entity-relation.entity.js';

export class PersonEntity {
    constructor(
        public id: string,
        public firstName: string | null = null,
        public lastName: string | null = null,
        public contactDetails: ContactDetailEntity[] = [],
        public entityRelations: PersonEntityRelationEntity[] = [],
        public createdAt: Date,
        public createdBy?: string,
        public updatedAt?: Date,
        public updatedBy?: string,
        public deletedBy?: string | null,
        public deletedAt?: Date | null,
    ) {}

    update(props: { firstName?: string; lastName?: string }, user: User): PersonEntity {
        this.firstName = props.firstName ?? this.firstName;
        this.lastName = props.lastName ?? this.lastName;
        this.updatedBy = user.accountId ?? this.updatedBy;
        return this;
    }

    addEntityRelation(entityRelation: PersonEntityRelationEntity): PersonEntity {
        this.entityRelations.push(entityRelation);
        return this;
    }

    addContactDetails(contactDetail: ContactDetailEntity): PersonEntity {
        this.contactDetails.push(contactDetail);
        return this;
    }
}
