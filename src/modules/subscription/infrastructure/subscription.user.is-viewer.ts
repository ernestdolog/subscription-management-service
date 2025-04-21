/**
 * The User View Permission
 * ========================
 * Adds where clause to filter out Subscription which the CurrentUser shall not see
 *
 * View permission for:
 * - Current User belongs to subscription
 */
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { User } from '#app/shared/authorization/tool/index.js';
import { SubscriptionDao } from './subscription.dao.js';

export function addUserViewPermissionFilterToSubscription(
    currentUser: User,
    queryBuilder: SelectQueryBuilder<SubscriptionDao>,
): SelectQueryBuilder<SubscriptionDao> {
    queryBuilder.andWhere(
        new Brackets(subQb => {
            /**
             * Current User belongs to subscription
             */
            subQb.where(`("${queryBuilder.alias}".id::varchar = :subscriptionId)`, {
                subscriptionId: currentUser.subscriptionId,
            });
        }),
    );

    return queryBuilder;
}
