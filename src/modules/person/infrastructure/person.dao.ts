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
import { ContactDetailDao } from '#app/modules/contact-detail/infrastructure/contact-detail.dao.js';
import { PersonEntityRelationDao } from './person-entity-relation.dao.js';
import { PersonEntity } from '../domain/index.js';

@Entity({ name: 'person' })
export class PersonDao extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => PersonEntityRelationDao, entityRelation => entityRelation.person, {
        cascade: ['soft-remove'],
    })
    entityRelations?: Relation<PersonEntityRelationDao>[];

    @OneToMany(() => ContactDetailDao, contactDetail => contactDetail.person, {
        cascade: ['soft-remove'],
    })
    contactDetails: Relation<ContactDetailDao>[];

    @Column({ type: 'varchar', nullable: true })
    firstName?: string | null;

    @Column({ type: 'varchar', nullable: true })
    lastName?: string | null;

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

    get toEntity(): PersonEntity {
        return new PersonEntity(
            this.id,
            this.firstName,
            this.lastName,
            this.contactDetails?.map(contactDetail => contactDetail.toEntity),
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
