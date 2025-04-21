import { AccountEntity } from '#app/modules/account/domain/index.js';
import { User } from '#app/shared/authorization/tool/index.js';

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

    addAccount(account: AccountEntity): SubscriptionEntity {
        this.accounts.push(account);
        return this;
    }
}
