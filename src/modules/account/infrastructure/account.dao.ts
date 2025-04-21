import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { PersonDao } from '#app/modules/person/infrastructure/person.dao.js';
import { AccountEntityRelationDao } from './account-entity-relation.dao.js';
import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import { AccountInvitationDao } from './account-invitation.dao.js';
import { AccountEntity } from '../domain/account.entity.js';

@Entity({ name: 'account' })
export class AccountDao<EntityType extends UserEntityType = UserEntityType> extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    /**
     * Holds string of actual object's arbitrary name that this account related to. Like
     * if this account belongs to Organisation or Person
     */
    @Column('varchar')
    entityType: EntityType;
    /**
     * Holds string of related entity's id, usually a primary key
     */
    @Column('varchar')
    entityId: string;

    @OneToOne(() => PersonDao, { createForeignKeyConstraints: false, nullable: true })
    @JoinColumn([{ name: 'entity_id', referencedColumnName: 'id' }])
    person: EntityType extends UserEntityType.PERSON ? Relation<PersonDao> | null : undefined;

    @OneToMany(() => AccountEntityRelationDao, entityRelation => entityRelation.account, {
        cascade: ['soft-remove'],
    })
    entityRelations?: Relation<AccountEntityRelationDao>[] | null;

    @OneToMany(() => AccountInvitationDao, invitation => invitation.account, {
        cascade: ['soft-remove'],
    })
    invitations?: Relation<AccountInvitationDao>[] | null;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'varchar', nullable: true })
    createdBy?: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'varchar', nullable: true })
    updatedBy?: string;

    @Column({ type: 'varchar', nullable: true })
    deletedBy?: string | null;

    @DeleteDateColumn()
    deletedAt?: Date | null;

    get toEntity(): AccountEntity {
        return new AccountEntity<EntityType>(
            this.id,
            this.entityType,
            this.entityId,
            this.person?.toEntity,
            this.entityRelations?.map(entityRelation => entityRelation.toEntity),
            this.invitations?.map(invitation => invitation.toEntity),
            this.createdAt,
            this.createdBy,
            this.updatedAt,
            this.updatedBy,
            this.deletedBy,
            this.deletedAt,
        );
    }
}
