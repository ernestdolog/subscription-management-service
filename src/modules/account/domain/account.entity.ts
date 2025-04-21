import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import { AccountInvitationEntity } from './account-invitation.entity.js';
import { AccountEntityRelationEntity } from './account-entity-relation.entity.js';
import { AccountEntityType } from './account.type.js';
import { AccountEntityRelationType } from './index.js';

export class AccountEntity<EntityType extends UserEntityType = UserEntityType.PERSON> {
    constructor(
        public id: string,
        public entityType: EntityType,
        public entityId: string,
        public entity: AccountEntityType[EntityType] | undefined | null,
        public entityRelations: AccountEntityRelationEntity[] = [],
        public invitations: AccountInvitationEntity[] = [],
        public createdAt: Date,
        public createdBy: string | undefined,
        public updatedAt: Date,
        public updatedBy?: string | undefined,
        public deletedBy?: string | null,
        public deletedAt?: Date | null,
    ) {}

    addEntityRelation(entityRelation: AccountEntityRelationEntity): AccountEntity {
        this.entityRelations.push(entityRelation);
        return this;
    }

    addInvitation(invitation: AccountInvitationEntity): AccountEntity {
        this.invitations.push(invitation);
        return this;
    }

    isInvited(): boolean {
        return this.invitations.length > 0;
    }

    isActive(): boolean {
        return (
            this.isInvited() && !this.invitations.find(invitation => invitation.isValid === true)
        );
    }

    toUser() {
        const user = new User({
            accountId: this.id,
            entityId: this.entityId,
            entityType: this.entityType,
            subscriptionId: this.entityRelations!.find(
                entityRelation =>
                    entityRelation.entityType === AccountEntityRelationType.SUBSCRIPTION,
            )!.entityId,
        });

        return user;
    }
}
