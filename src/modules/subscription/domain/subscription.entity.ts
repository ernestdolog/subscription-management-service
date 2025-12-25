import { AccountEntity } from '#app/modules/account/domain/index.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { CommonError } from '#app/shared/error/index.js';

export class SubscriptionEntity {
    constructor(
        public id: string,
        public accounts: AccountEntity[] = [],
        public name: string,
        public createdAt: Date,
        public createdBy: string | undefined,
        public updatedAt: Date,
        public updatedBy?: string,
        public deletedBy?: string | null,
        public deletedAt?: Date | null,
    ) {}

    update(props: { name?: string }, user: User): SubscriptionEntity {
        this.name = props.name ?? this.name;
        this.updatedBy = user.accountId ?? this.updatedBy;
        return this;
    }

    /**
     * Aggregate method: Add account to subscription.
     * Enforces business rules at aggregate level.
     * @throws InternalServerError if account with same entityType and entityId already exists
     */
    addAccount(account: AccountEntity): SubscriptionEntity {
        const existing = this.accounts.find(
            element =>
                element.entityType === account.entityType && element.entityId === account.entityId,
        );
        if (existing) {
            throw new InternalServerError(CommonError.CONFLICT, {
                resource: 'Account',
                value: account.entityId,
            });
        }

        this.accounts.push(account);
        return this;
    }

    /**
     * Aggregate method: Remove account from subscription.
     * @throws InternalServerError if account not found or is the last active account
     */
    removeAccount(accountId: string): SubscriptionEntity {
        const index = this.accounts.findIndex(element => element.id === accountId);
        if (index === -1) {
            throw new InternalServerError(CommonError.NOT_FOUND, {
                resource: 'Account',
            });
        }

        const activeAccounts = this.accounts.filter(
            element => element.isActive() && !element.deletedAt,
        );
        if (
            activeAccounts.length <= 1 &&
            activeAccounts.some(element => element.id === accountId)
        ) {
            throw new InternalServerError(CommonError.NOT_CREATE_REQUEST, {
                resource: 'Cannot remove the last active account from subscription',
            });
        }

        this.accounts.splice(index, 1);
        return this;
    }

    /**
     * Find an account by its ID within this subscription.
     */
    findAccount(accountId: string): AccountEntity | undefined {
        return this.accounts.find(a => a.id === accountId);
    }

    /**
     * Get all active accounts in this subscription.
     */
    getActiveAccounts(): AccountEntity[] {
        return this.accounts.filter(a => a.isActive() && !a.deletedAt);
    }
}
