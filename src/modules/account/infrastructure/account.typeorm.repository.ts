import { dataSource } from '#app/configs/index.js';
import { AccountDao } from './index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { EntityManager, FindOptionsRelations, FindOptionsWhere } from 'typeorm';
import { addUserViewPermissionFiltertoAccount } from './account.user.is-viewer.js';
import { AccountEntity } from '../domain/index.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';

const getTypeOrmRepository = () =>
    dataSource.getRepository<AccountDao>(AccountDao).extend({
        findOne(props: {
            where: FindOptionsWhere<AccountDao>[] | FindOptionsWhere<AccountDao>;
            relations?: FindOptionsRelations<AccountDao>;
            user: User;
        }): Promise<AccountDao | null> {
            const queryBuilder = this.createQueryBuilder();
            queryBuilder.where(props.where);
            queryBuilder.setFindOptions({
                relations: props.relations,
            });
            addUserViewPermissionFiltertoAccount(props.user, queryBuilder);
            return queryBuilder.getOne();
        },
        async getOneWithRelations(id: string, user: User): Promise<AccountEntity | undefined> {
            const account = await this.findOne({
                user,
                where: { id },
                relations: { person: { contactDetails: true }, invitations: true },
            });
            return account?.toEntity;
        },
        async preserveNew(
            input: Partial<AccountEntity> & { entity: NonNullable<AccountEntity['entity']> },
            user?: User,
        ) {
            const accountDaoInput = {
                id: input.id,
                entityType: input.entityType,
                entityId: input.entity!.id,
                entityRelations: input.entityRelations,
                invitations: input.invitations,
                createdAt: input.createdAt,
                createdBy: user?.accountId,
                updatedAt: input.updatedAt,
                updatedBy: user?.accountId,
            };
            const accountDaoCandidate = this.create(accountDaoInput);
            const accountDao = await this.save(accountDaoCandidate);
            const entity = accountDao.toEntity;
            entity.entity = input.entity;
            return entity;
        },
        async preserve(id: string, update: Partial<AccountEntity>) {
            await this.update({ id }, update);
        },
        async softDelete(
            account: Partial<AccountEntity> & { id: string },
            user: User,
        ): Promise<AccountEntity> {
            const deletedBy = {
                deletedBy: user.accountId,
                updatedBy: user.accountId,
            };
            await this.update({ id: account.id }, deletedBy);
            Object.assign(account, deletedBy);
            await this.softRemove(account as AccountEntity);
            return account as AccountEntity;
        },
    });

export function getTypeOrmAccountRepository(manager: AbstractTransactionManager) {
    const typeOrmAccountRepository = getTypeOrmRepository();
    if (!manager.context) return typeOrmAccountRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(typeOrmAccountRepository);
}
