import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { AccountEntityRelationType } from '../domain/account-entity-relation.enum.js';
import { SubscriptionDao } from '#app/modules/subscription/infrastructure/subscription.dao.js';
import { AccountDao } from './account.dao.js';
import { AccountEntityRelationEntity } from '../domain/account-entity-relation.entity.js';

@Entity({ name: 'account_entity_relation' })
export class AccountEntityRelationDao<
    EntityType extends AccountEntityRelationType = AccountEntityRelationType,
> extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    accountId: string;

    @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
    @ManyToOne(() => AccountDao, account => account.entityRelations, {
        onDelete: 'CASCADE',
    })
    account?: Relation<AccountDao> | null;
    /**
     * Holds string of actual object's arbitrary name that this Person related to. Like
     * if this Person belongs to Subscription
     */
    @Column({ type: 'varchar', nullable: false })
    entityType: EntityType;
    /**
     * Holds related entity's id, a primary identifier
     */
    @Column({ type: 'uuid', nullable: false })
    entityId: string;

    @ManyToOne(() => SubscriptionDao, {
        createForeignKeyConstraints: false,
        nullable: true,
    })
    @JoinColumn([{ name: 'entity_id', referencedColumnName: 'id' }])
    subscription: EntityType extends AccountEntityRelationType.SUBSCRIPTION
        ? Relation<SubscriptionDao> | null
        : undefined;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'varchar', nullable: true })
    createdBy: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'varchar', nullable: true })
    updatedBy: string;

    @Column({ type: 'varchar', nullable: true })
    deletedBy?: string | null;

    @DeleteDateColumn()
    deletedAt?: Date | null;

    get toEntity(): AccountEntityRelationEntity {
        return new AccountEntityRelationEntity<EntityType>(
            this.id,
            this.accountId,
            this.entityType,
            this.entityId,
            this.createdAt,
            this.createdBy,
            this.updatedAt,
            this.updatedBy,
            this.deletedBy,
            this.deletedAt,
        );
    }
}
