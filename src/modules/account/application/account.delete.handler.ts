import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { AccountRepository, getAccountRepository } from '#app/modules/account/domain/index.js';
import { getPersonRepository, PersonRepository } from '#app/modules/person/domain/index.js';
import {
    ContactDetailRepository,
    getContactDetailRepository,
} from '#app/modules/contact-detail/domain/index.js';
import { AccountEntity } from '../domain/index.js';
import { UserDeleteHandler } from '#app/modules/authentication/application/user.delete.handler.js';

type AccountDeleteCommand = {
    id: string;
    user: User;
};

export class AccountDeleteHandler extends AbstractService<AccountDeleteCommand, AccountEntity> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(command: AccountDeleteCommand): Promise<AccountEntity> {
        const l = this.l.child({ ctx: command });
        l.info('receive');

        const account = await this.accountRepository.getOneWithRelations(command.id, command.user);

        if (!account) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Account' });
        }

        if (account.id === command.user.accountId) {
            throw new InternalServerError(CommonError.FORBIDDEN);
        }

        if (!account.entity) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Person' });
        }

        await this.personRepository.softDelete(account.entity, command.user);

        const softRemoved = await this.accountRepository.softDelete(account, command.user);

        for (const contactDetail of account.entity?.contactDetails) {
            await this.contactDetailRepository.softDelete(contactDetail, command.user);
        }

        if (account.invitations?.find(invitation => invitation.isValid === false)) {
            await this.deleteUser.execute({ accountId: account.id, user: command.user });
        }

        l.info('success');
        return softRemoved;
    }

    private get deleteUser(): UserDeleteHandler {
        return new UserDeleteHandler();
    }

    private get personRepository(): PersonRepository {
        return getPersonRepository(this.manager);
    }

    private get accountRepository(): AccountRepository {
        return getAccountRepository(this.manager);
    }

    private get contactDetailRepository(): ContactDetailRepository {
        return getContactDetailRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'AccountDeleteHandler',
        });
    }
}
