import { dataSource } from '#app/configs/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { EntityManager, FindOptionsRelations, FindOptionsWhere } from 'typeorm';
import { AccountInvitationDao } from './account-invitation.dao.js';
import { randomUUID } from 'node:crypto';
import { addUserViewPermissionFilterToAccountInvitation } from './account-invitation.user.is-viewer.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { AccountEntity, AccountInvitationEntity } from '../domain/index.js';

const TypeOrmAccountInvitationRepository = dataSource
    .getRepository<AccountInvitationDao>(AccountInvitationDao)
    .extend({
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
            const token = randomUUID();
            const isValid = true;
            const invitation = this.create({
                accountId,
                token,
                isValid,
                createdBy: user.accountId,
                updatedBy: user.accountId,
            });
            const res = await this.save(invitation);
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
        async preserve(id: string, input: Partial<AccountEntity>) {
            await this.update({ id }, input);
        },
    });

export function getTypeOrmAccountInvitationRepository(
    manager: AbstractTransactionManager,
): typeof TypeOrmAccountInvitationRepository {
    if (!manager.context) return TypeOrmAccountInvitationRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(TypeOrmAccountInvitationRepository);
}
