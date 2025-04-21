import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import { faker } from '@faker-js/faker';

export const userFactory = (input?: Partial<User>) =>
    Object.assign(
        new User({
            accountId: faker.string.uuid(),
            entityType: faker.helpers.arrayElement<UserEntityType>(Object.values(UserEntityType)),
            entityId: faker.string.uuid(),
            subscriptionId: faker.string.uuid(),
        }),
        input,
    );
