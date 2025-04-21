import { AccountInvitationDao } from '#app/modules/account/infrastructure/index.js';
import { Faker } from '@faker-js/faker';
import { useSeederFactoryManager } from 'typeorm-extension';

const manager = useSeederFactoryManager();

manager.set(AccountInvitationDao, (faker: Faker) => {
    return AccountInvitationDao.create({
        id: faker.string.uuid(),
        accountId: faker.string.uuid(),
        token: faker.string.uuid(),
        isValid: faker.datatype.boolean(),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const accountInvitationFactory = () => manager.get(AccountInvitationDao);
