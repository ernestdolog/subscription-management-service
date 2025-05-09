import { getPersonRepository, PersonRepository } from '#app/modules/person/domain/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { PersonEntity } from '../domain/person.entity.js';

type PersonRetrieveQuery = {
    id: string;
    user: User;
};

export class PersonRetrieveHandler extends AbstractService<PersonRetrieveQuery, PersonEntity> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(query: PersonRetrieveQuery): Promise<PersonEntity> {
        const l = this.l.child({ ctx: query });
        l.info('receive');

        const person = await this.personRepository.getOneWithAllRelated(query.id, query.user);

        if (!person) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Person' });
        }

        l.info('success');
        return person;
    }

    private get personRepository(): PersonRepository {
        return getPersonRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'PersonRetrieveHandler',
        });
    }
}
