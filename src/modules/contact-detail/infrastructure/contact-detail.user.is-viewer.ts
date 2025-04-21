/**
 * The User View Permission
 * ========================
 * Adds where clause to filter out ContactDetail which the CurrentUser shall not see
 *
 * View permission for:
 * - Created by Current User
 * - Related to Current Users Subscription
 */
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { User } from '#app/shared/authorization/tool/index.js';
import { ContactDetailDao } from './contact-detail.dao.js';
import { ContactDetailEntityRelationType } from '../domain/index.js';

export function addUserViewPermissionFiltertoContactDetail(
    currentUser: User,
    queryBuilder: SelectQueryBuilder<ContactDetailDao>,
): SelectQueryBuilder<ContactDetailDao> {
    queryBuilder.leftJoin(`${queryBuilder.alias}.entityRelations`, 'entityRelations');
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
                    entityType: ContactDetailEntityRelationType.SUBSCRIPTION,
                },
            );
        }),
    );

    return queryBuilder;
}
