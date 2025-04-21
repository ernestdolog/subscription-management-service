import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { ContactDetailEntityRelationEntity } from './contact-detail-entity-relation.entity.js';
import {
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from './contact-detail.enum.js';

export class ContactDetailEntity {
    constructor(
        public id: string,
        public entityType: ContactDetailEntityType,
        public entityId: string,
        public type: ContactDetailType,
        public detail: string,
        public tag: ContactDetailTag,
        public entityRelations: ContactDetailEntityRelationEntity[] = [],
        public createdAt: Date,
        public createdBy: string,
        public updatedAt: Date,
        public updatedBy: string,
        public deletedBy?: string | null,
        public deletedAt?: Date | null,
    ) {}

    update(
        props: { type?: ContactDetailType; detail?: string; tag?: ContactDetailTag },
        user: User,
    ): ContactDetailEntity {
        this.type = props.type ?? this.type;
        this.detail = props.detail ?? this.detail;
        this.tag = props.tag ?? this.tag;
        this.updatedBy = user.accountId ?? this.updatedBy;
        return this;
    }

    isLoginEmailChange(props: {
        type?: ContactDetailType;
        detail?: string;
        tag?: ContactDetailTag;
    }): boolean {
        const isEmail = this.type === ContactDetailType.EMAIL;
        const isAppSignup = (this.tag = ContactDetailTag.APP_SIGNUP);
        const isDetailChanage = !!props.detail;
        return isEmail && isAppSignup && isDetailChanage;
    }

    addEntityRelation(entityRelation: ContactDetailEntityRelationEntity): ContactDetailEntity {
        this.entityRelations.push(entityRelation);
        return this;
    }
}
