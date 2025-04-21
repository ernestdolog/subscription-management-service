import { UserEntityType } from './authorization.user.enum.js';

export class User {
    accountId: string;
    entityType: UserEntityType;
    entityId: string;
    subscriptionId: string;

    constructor(properties: {
        accountId: string;
        entityType: UserEntityType;
        entityId: string;
        subscriptionId: string;
    }) {
        this.accountId = properties.accountId;
        this.entityType = properties.entityType;
        this.entityId = properties.entityId;
        this.subscriptionId = properties.subscriptionId;
    }
}
