import {
    AccountRepository,
    getAccountRepository,
} from '#app/modules/account/domain/account.repository.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { AccountEntity } from '../domain/account.entity.js';

type AccountRetrieveQuery = {
    id: string;
    user: User;
};

export class AccountRetrieveHandler extends AbstractService<AccountRetrieveQuery, AccountEntity> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(query: AccountRetrieveQuery): Promise<AccountEntity> {
        const l = this.l.child({ ctx: query });
        l.info('receive');

        const account = await this.accountRepository.getOneWithRelations(query.id, query.user);

        if (!account) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Account' });
        }

        l.info('success');
        return account;
    }

    private get accountRepository(): AccountRepository {
        return getAccountRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'AccountRetrieveHandler',
        });
    }
}
