/**
 * The User View Permission
 * ========================
 * Adds where clause to filter out Account which the CurrentUser shall not see
 *
 * View permission for:
 * - Created by Current User
 * - Related to Current Users Subscription
 */
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { AccountEntityRelationType } from '../domain/account-entity-relation.enum.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { AccountInvitationDao } from './account-invitation.dao.js';

export function addUserViewPermissionFilterToAccountInvitation(
    currentUser: User,
    queryBuilder: SelectQueryBuilder<AccountInvitationDao>,
): SelectQueryBuilder<AccountInvitationDao> {
    queryBuilder.leftJoin(`${queryBuilder.alias}.account`, 'account');
    queryBuilder.leftJoin(`account.entityRelations`, 'entityRelations');
    queryBuilder.andWhere(
        new Brackets(subQb => {
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
