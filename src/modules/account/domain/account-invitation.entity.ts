import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { AccountEntity } from './account.entity.js';

export class AccountInvitationEntity {
    constructor(
        public id: string,
        public accountId: string,
        public account: AccountEntity | undefined,
        public token: string,
        public isValid: boolean,
        public createdAt: Date,
        public createdBy?: string,
        public updatedAt?: Date,
        public updatedBy?: string,
        public deletedBy?: string | null,
        public deletedAt?: Date | null,
    ) {}

    revoke(user: User): AccountInvitationEntity {
        const isValid = this.isValid;
        const isUser = this.accountId === user.accountId;
        if (!isValid || !isUser) throw new InternalServerError(CommonError.FORBIDDEN);
        this.isValid = false;
        this.updatedBy = user.accountId;
        return this;
    }
}
