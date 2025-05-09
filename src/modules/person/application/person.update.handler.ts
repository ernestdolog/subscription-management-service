import { getPersonRepository, PersonRepository } from '#app/modules/person/domain/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { PersonEntity } from '../domain/person.entity.js';

type PersonUpdateCommand = {
    id: string;
    firstName?: string;
    lastName?: string;
    user: User;
};

export class PersonUpdateHandler extends AbstractService<PersonUpdateCommand, PersonEntity> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(command: PersonUpdateCommand): Promise<PersonEntity> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const person = await this.personRepository.getOne(command.id, command.user);
        if (!person) throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Person' });

        const updatedPerson = person.update(command, command.user);

        await this.personRepository.preserve(person.id, updatedPerson);

        l.info('success');
        return updatedPerson;
    }

    private get personRepository(): PersonRepository {
        return getPersonRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'PersonUpdateHandler',
        });
    }
}
