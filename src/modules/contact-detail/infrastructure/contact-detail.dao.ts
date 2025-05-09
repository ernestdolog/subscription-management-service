import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import {
    ContactDetailEntity,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '../domain/index.js';
import { PersonDao } from '#app/modules/person/infrastructure/index.js';
import { ContactDetailEntityRelationDao } from './contact-detail-entity-relation.dao.js';

@Entity({ name: 'contact_detail' })
@Index(['entityId', 'entityType'], { unique: false })
@Index(['entityId', 'entityType', 'type', 'tag', 'detail'], { unique: true })
export class ContactDetailDao<
    EntityType extends ContactDetailEntityType = ContactDetailEntityType,
> extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Holds string of actual object's arbitrary name that this account related to. Like
     * if this acontact-detail belongs to Organisation or Person
     */
    @Column('varchar')
    entityType: EntityType;

    /**
     * Holds string of related entity's id, usually a primary key
     */
    @Column('varchar')
    entityId: string;

    @ManyToOne(() => PersonDao, person => person.contactDetails, {
        createForeignKeyConstraints: false,
        nullable: true,
    })
    @JoinColumn([{ name: 'entity_id', referencedColumnName: 'id' }])
    person: EntityType extends ContactDetailEntityType.PERSON
        ? Relation<PersonDao> | null
        : undefined;

    @OneToMany(
        () => ContactDetailEntityRelationDao,
        entityRelation => entityRelation.contactDetail,
        {
            cascade: ['soft-remove'],
        },
    )
    entityRelations?: Relation<ContactDetailEntityRelationDao>[] | null;

    @Column({ type: 'varchar' })
    type: ContactDetailType;

    @Column({ type: 'varchar' })
    detail: string;

    @Column({ type: 'varchar' })
    tag: ContactDetailTag;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'varchar' })
    createdBy: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'varchar' })
    updatedBy: string;

    @Column({ type: 'varchar', nullable: true })
    deletedBy?: string | null;

    @DeleteDateColumn()
    deletedAt?: Date | null;

    get toEntity(): ContactDetailEntity {
        return new ContactDetailEntity(
            this.id,
            this.entityType,
            this.entityId,
            this.type,
            this.detail,
            this.tag,
            this.entityRelations?.map(entityRelation => entityRelation.toEntity),
            this.createdAt,
            this.createdBy,
            this.updatedAt,
            this.updatedBy,
            this.deletedBy,
            this.deletedAt,
        );
    }
}
