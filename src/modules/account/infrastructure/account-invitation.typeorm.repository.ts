import { dataSource } from '#app/configs/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { EntityManager, FindOptionsRelations, FindOptionsWhere } from 'typeorm';
import { AccountInvitationDao } from './account-invitation.dao.js';
import { addUserViewPermissionFilterToAccountInvitation } from './account-invitation.user.is-viewer.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { AccountInvitationEntity } from '../domain/index.js';

const getTypeOrmRepository = () =>
    dataSource.getRepository<AccountInvitationDao>(AccountInvitationDao).extend({
        findOneWithPermission(props: {
            where:
                | FindOptionsWhere<AccountInvitationDao>[]
                | FindOptionsWhere<AccountInvitationDao>;
            relations?: FindOptionsRelations<AccountInvitationDao>;
            user: User;
        }): Promise<AccountInvitationDao | null> {
            const queryBuilder = this.createQueryBuilder();
            queryBuilder.where(props.where);
            queryBuilder.setFindOptions({
                relations: props.relations,
            });
            addUserViewPermissionFilterToAccountInvitation(props.user, queryBuilder);
            return queryBuilder.getOne();
        },
        async provide(accountId: string, user: User): Promise<AccountInvitationEntity> {
            // The creation invariant (fresh Token + isValid) now lives in the domain factory.
            const invitation = AccountInvitationEntity.create({
                accountId,
                createdBy: user.accountId,
            });
            // Map the aggregate to its DAO for persistence. There is no generic toDao in
            // this repo; field-map inline, the mirror of the DAO's `get toEntity()`.
            const dao = this.create({
                id: invitation.id,
                accountId: invitation.accountId,
                token: invitation.token,
                isValid: invitation.isValid,
                createdBy: invitation.createdBy,
                updatedBy: invitation.updatedBy,
            });
            const res = await this.save(dao);
            return res.toEntity;
        },
        async getOne(token: string): Promise<AccountInvitationEntity | undefined> {
            const existing = await this.findOne({
                where: { token, isValid: true },
                relations: {
                    account: {
                        entityRelations: { subscription: true },
                        person: { contactDetails: true },
                        invitations: true,
                    },
                },
            });
            return existing?.toEntity;
        },
        async preserve(id: string, input: Partial<AccountInvitationEntity>) {
            // Field-map to SCALAR columns only — never hand the whole aggregate (Token VO +
            // nested `account` relation) to `.update()`; that would try to persist objects
            // into varchar columns. `revoke()` only changes these two.
            await this.update({ id }, { isValid: input.isValid, updatedBy: input.updatedBy });
        },
    });

export function getTypeOrmAccountInvitationRepository(manager: AbstractTransactionManager) {
    const typeOrmAccountInvitationRepository = getTypeOrmRepository();
    if (!manager.context) return typeOrmAccountInvitationRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(typeOrmAccountInvitationRepository);
}
