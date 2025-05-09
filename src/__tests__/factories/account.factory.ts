import { Faker } from '@faker-js/faker';
import { useSeederFactoryManager } from 'typeorm-extension';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { AccountDao } from '#app/modules/account/infrastructure/account.dao.js';

const manager = useSeederFactoryManager();

manager.set(AccountDao, (faker: Faker) => {
    return AccountDao.create({
        id: faker.string.uuid(),
        entityType: faker.helpers.arrayElement<UserEntityType>(Object.values(UserEntityType)),
        entityId: faker.string.uuid(),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const accountFactory = () => manager.get(AccountDao);
