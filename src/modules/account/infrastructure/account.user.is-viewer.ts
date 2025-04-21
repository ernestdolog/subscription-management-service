/**
 * The User View Permission
 * ========================
 * Adds where clause to filter out Account which the CurrentUser shall not see
 *
 * View permission for:
 * - Identity is Current User
 * - Created by Current User
 * - Related to Current Users Subscription
 */
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { AccountDao } from '#app/modules/account/infrastructure/account.dao.js';
import { AccountEntityRelationType } from '../domain/account-entity-relation.enum.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';

export function addUserViewPermissionFiltertoAccount(
    currentUser: User,
    queryBuilder: SelectQueryBuilder<AccountDao<UserEntityType>>,
): SelectQueryBuilder<AccountDao> {
    queryBuilder.leftJoin(`${queryBuilder.alias}.entityRelations`, 'entityRelations');
    queryBuilder.andWhere(
        new Brackets(subQb => {
            /**
             * Identity is Current User
             */
            subQb.where(`("${queryBuilder.alias}".id::varchar = :accountId)`, {
                accountId: currentUser.accountId,
            });
            /**
             * Created by Current User
             */
            subQb.orWhere(`("${queryBuilder.alias}".created_by = :accountId)`, {
                accountId: currentUser.accountId,
            });
            /**
             * Related to Current Users Subscription
             */
            subQb.orWhere(
                `(entityRelations.entity_type = :entityType AND entityRelations.entity_id = :entityId)`,
                {
                    entityId: currentUser.subscriptionId,
                    entityType: AccountEntityRelationType.SUBSCRIPTION,
                },
            );
        }),
    );

    return queryBuilder;
}
