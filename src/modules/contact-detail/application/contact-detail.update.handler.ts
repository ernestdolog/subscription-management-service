import {
    ContactDetailEntity,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import {
    ContactDetailRepository,
    getContactDetailRepository,
} from '#app/modules/contact-detail/domain/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { UserUpdateHandler } from '#app/modules/authentication/application/index.js';

type ContactDetailUpdateCommand = {
    id: string;
    user: User;
    type?: ContactDetailType;
    tag?: ContactDetailTag;
    detail?: string;
};

export class ContactDetailUpdateHandler extends AbstractService<
    ContactDetailUpdateCommand,
    ContactDetailEntity
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        command: ContactDetailUpdateCommand,
    ): Promise<ContactDetailEntity> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const contactDetail = await this.contactDetailRepository.getOne(command.id, command.user);
        if (!contactDetail)
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'ContactDetail' });

        const updatedContactDetail = contactDetail.update(command, command.user);

        await this.contactDetailRepository.preserve(contactDetail.id, updatedContactDetail);

        if (contactDetail.isLoginEmailChange(command)) {
            await this.updateLoginEmail(command.user, command.detail!);
        }

        l.info('success');
        return contactDetail;
    }

    private async updateLoginEmail(user: User, email: string): Promise<User> {
        return this.updateUser.execute({
            ...user,
            email,
        });
    }

    private get updateUser(): UserUpdateHandler {
        return new UserUpdateHandler();
    }

    private get contactDetailRepository(): ContactDetailRepository {
        return getContactDetailRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'ContactDetailUpdateHandler',
        });
    }
}
