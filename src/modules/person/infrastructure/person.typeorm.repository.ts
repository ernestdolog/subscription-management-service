import { dataSource } from '#app/configs/index.js';
import { PersonDao } from './person.dao.js';
import { PersonEntity } from '../domain/person.entity.js';
import { EntityManager, FindOptionsRelations, FindOptionsWhere } from 'typeorm';
import { addUserViewPermissionFilterToPerson } from './person.user.is-viewer.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';

const TypeOrmPersonRepository = dataSource.getRepository<PersonDao>(PersonDao).extend({
    findOne(props: {
        where: FindOptionsWhere<PersonDao>[] | FindOptionsWhere<PersonDao>;
        relations?: FindOptionsRelations<PersonDao>;
        user: User;
    }): Promise<PersonDao | null> {
        const queryBuilder = this.createQueryBuilder();
        queryBuilder.where(props.where);
        queryBuilder.setFindOptions({
            relations: props.relations,
        });
        addUserViewPermissionFilterToPerson(props.user, queryBuilder);
        return queryBuilder.getOne();
    },
    async getOneWithAllRelated(id: string, user: User): Promise<PersonEntity | undefined> {
        const res = await this.findOne({
            user: user,
            where: { id },
            relations: { contactDetails: true },
        });

        return res?.toEntity;
    },
    async getOne(id: string, user: User): Promise<PersonEntity | undefined> {
        const res = await this.findOne({
            user: user,
            where: { id },
        });
        return res?.toEntity;
    },
    async preserve(id: string, input: Partial<PersonEntity>) {
        const update = {
            id: input.id,
            firstName: input.firstName,
            lastName: input.lastName,
            createdAt: input.createdAt,
            createdBy: input.createdBy,
            updatedAt: input.updatedAt,
            updatedBy: input.updatedBy,
            deletedBy: input.deletedBy,
            deletedAt: input.deletedAt,
        };
        await this.update({ id }, update);
    },
    async preserveNew(
        input: Partial<PersonEntity> & Pick<PersonEntity, 'firstName' | 'lastName'>,
        user?: User,
    ) {
        const created = this.create({
            ...input,
            createdBy: user?.accountId,
            updatedBy: user?.accountId,
        });
        const res = await this.save(created);
        return res.toEntity;
    },
    async softDelete(entity: Partial<PersonEntity> & Pick<PersonEntity, 'id'>, user: User) {
        const deletedBy = {
            deletedBy: user.accountId,
            updatedBy: user.accountId,
        };
        await this.update({ id: entity.id }, deletedBy);
        Object.assign(entity, deletedBy);
        const res = await this.softRemove(entity);
        return res.toEntity;
    },
});

export function getTypeOrmPersonRepository(
    manager: AbstractTransactionManager,
): typeof TypeOrmPersonRepository {
    if (!manager.context) return TypeOrmPersonRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(TypeOrmPersonRepository);
}
