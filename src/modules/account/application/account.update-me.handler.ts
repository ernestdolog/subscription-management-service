import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { AccountEntity } from '../domain/account.entity.js';
import { getPersonRepository, PersonRepository } from '#app/modules/person/infrastructure/index.js';
import { AccountRepository, getAccountRepository } from '../infrastructure/index.js';

type AccountUpdateMeCommand = {
    firstName?: string;
    lastName?: string;
    user: User;
};

export class AccountUpdateMeHandler extends AbstractService<
    AccountUpdateMeCommand,
    AccountEntity<UserEntityType.PERSON>
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        command: AccountUpdateMeCommand,
    ): Promise<AccountEntity<UserEntityType.PERSON>> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const account = await this.accountRepository.getOneWithRelations(
            command.user.accountId,
            command.user,
        );
        if (!account) throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Account' });
        if (!account.entity)
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Person' });

        const person = account.entity;

        const updatedPerson = person.update(command, command.user);

        await this.personRepository.preserve(updatedPerson.id, updatedPerson);
        account.entity = updatedPerson;

        l.info('success');
        return account;
    }

    private get personRepository(): PersonRepository {
        return getPersonRepository(this.manager);
    }

    private get accountRepository(): AccountRepository {
        return getAccountRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'AccountUpdateMeHandler',
        });
    }
}
