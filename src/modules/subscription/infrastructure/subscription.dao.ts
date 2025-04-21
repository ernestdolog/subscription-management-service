import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { AccountEntityRelationDao } from '#app/modules/account/infrastructure/account-entity-relation.dao.js';
import { SubscriptionEntity } from '../domain/subscription.entity.js';

@Entity({ name: 'subscription' })
export class SubscriptionDao extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @OneToMany(() => AccountEntityRelationDao, entityRelation => entityRelation.subscription, {
        cascade: ['soft-remove'],
    })
    accountEntityRelations?: Relation<AccountEntityRelationDao>[] | null;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'varchar', nullable: true })
    createdBy?: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'varchar', nullable: true })
    updatedBy: string;

    @Column({ type: 'varchar', nullable: true })
    deletedBy?: string | null;

    @DeleteDateColumn()
    deletedAt?: Date | null;

    get toEntity(): SubscriptionEntity {
        return new SubscriptionEntity(
            this.id,
            this.accountEntityRelations?.map(
                accountEntityRelation => accountEntityRelation.account!.toEntity,
            ),
            this.name,
            this.createdAt,
            this.createdBy,
            this.updatedAt,
            this.updatedBy,
            this.deletedBy,
            this.deletedAt,
        );
    }
}
