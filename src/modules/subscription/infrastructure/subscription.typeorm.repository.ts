import { dataSource } from '#app/configs/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { FindOptionsWhere, FindOptionsRelations, EntityManager } from 'typeorm';
import { SubscriptionDao } from './subscription.dao.js';
import { addUserViewPermissionFilterToSubscription } from './subscription.user.is-viewer.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { SubscriptionEntity } from '../domain/subscription.entity.js';

const getTypeOrmRepository = () =>
    dataSource.getRepository<SubscriptionDao>(SubscriptionDao).extend({
        findOneWithPermission(props: {
            where: FindOptionsWhere<SubscriptionDao>[] | FindOptionsWhere<SubscriptionDao>;
            relations?: FindOptionsRelations<SubscriptionDao>;
            user?: User;
        }): Promise<SubscriptionDao | null> {
            const queryBuilder = this.createQueryBuilder();
            queryBuilder.where(props.where);
            queryBuilder.setFindOptions({
                relations: props.relations,
            });
            if (props.user) addUserViewPermissionFilterToSubscription(props.user, queryBuilder);
            return queryBuilder.getOne();
        },
        async getOne(id: string, user?: User): Promise<SubscriptionEntity | undefined> {
            const aubscription = await this.findOneWithPermission({
                user,
                where: { id },
            });
            return aubscription?.toEntity;
        },
        async getOneWithRelations(id: string, user?: User) {
            const subscription = await this.findOneWithPermission({
                user,
                where: { id },
                relations: {
                    accountEntityRelations: {
                        account: { person: { contactDetails: true }, invitations: true },
                    },
                },
            });
            return subscription?.toEntity;
        },
        async preserveNew(
            input: Partial<SubscriptionEntity> & Pick<SubscriptionEntity, 'name'>,
            user?: User,
        ) {
            const subscriptionCandidate = this.create({
                ...input,
                createdBy: user?.accountId,
                updatedBy: user?.accountId,
            });
            const res = await this.save(subscriptionCandidate);
            return res.toEntity;
        },
        async preserve(id: string, input: Partial<SubscriptionEntity>) {
            const update = {
                id: input.id,
                name: input.name,
                createdAt: input.createdAt,
                createdBy: input.id,
                updatedAt: input.updatedAt,
                updatedBy: input.updatedBy,
                deletedBy: input.deletedBy,
                deletedAt: input.deletedAt,
            };
            await this.update({ id }, update);
        },
    });

export function getTypeOrmSubscriptionRepository(manager: AbstractTransactionManager) {
    const typeOrmSubscriptionRepository = getTypeOrmRepository();
    if (!manager.context) return typeOrmSubscriptionRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(typeOrmSubscriptionRepository);
}
