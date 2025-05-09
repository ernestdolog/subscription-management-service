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
import { PersonEntityRelationEntity, PersonEntityRelationType } from '../domain/index.js';
import { PersonDao } from './index.js';

@Entity({ name: 'person_entity_relation' })
export class PersonEntityRelationDao<
    EntityType extends PersonEntityRelationType = PersonEntityRelationType,
> extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    personId: string;

    @JoinColumn({ name: 'person_id', referencedColumnName: 'id' })
    @ManyToOne(() => PersonDao, person => person.entityRelations, {
        onDelete: 'CASCADE',
    })
    person?: Relation<PersonDao> | null;

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

    get toEntity(): PersonEntityRelationEntity {
        return new PersonEntityRelationEntity<EntityType>(
            this.id,
            this.personId,
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
