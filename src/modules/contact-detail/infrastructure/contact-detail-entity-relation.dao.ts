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
import {
    ContactDetailEntityRelationEntity,
    ContactDetailEntityRelationType,
} from '../domain/index.js';
import { ContactDetailDao } from './contact-detail.dao.js';

@Entity({ name: 'contact_detail_entity_relation' })
export class ContactDetailEntityRelationDao<
    EntityType extends ContactDetailEntityRelationType = ContactDetailEntityRelationType,
> extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    contactDetailId: string;

    @JoinColumn({ name: 'contact_detail_id', referencedColumnName: 'id' })
    @ManyToOne(() => ContactDetailDao, contactDetail => contactDetail.entityRelations, {
        onDelete: 'CASCADE',
    })
    contactDetail?: Relation<ContactDetailDao> | null;

    /**
     * Holds string of actual object's arbitrary name that this Person related to. Like
     * if this Person belongs to Subscription
     */
    @Column({ type: 'varchar', nullable: false })
    entityType: EntityType;

    /**
     * Holds related entity's id, a primary identifier
     */
    @Column({ type: 'varchar', nullable: false })
    entityId: string;

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

    get toEntity(): ContactDetailEntityRelationEntity {
        return new ContactDetailEntityRelationEntity(
            this.id,
            this.contactDetailId,
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
