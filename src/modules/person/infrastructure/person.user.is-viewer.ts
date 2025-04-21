/**
 * The User View Permission
 * ========================
 * Adds where clause to filter out Person which the CurrentUser shall not see
 *
 * View permission for:
 * - Created by Current User
 * - Related to Current Users Subscription
 */
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { User } from '#app/shared/authorization/tool/index.js';
import { PersonDao } from './person.dao.js';
import { PersonEntityRelationType } from '../domain/person-entity-relation.enum.js';

export function addUserViewPermissionFilterToPerson(
    currentUser: User,
    queryBuilder: SelectQueryBuilder<PersonDao>,
): SelectQueryBuilder<PersonDao> {
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
                    entityType: PersonEntityRelationType.SUBSCRIPTION,
                },
            );
        }),
    );

    return queryBuilder;
}
