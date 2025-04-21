import { AccountEntityRelationType } from '#app/modules/account/domain/index.js';
import { AccountEntityRelationDao } from '#app/modules/account/infrastructure/index.js';
import { Faker } from '@faker-js/faker';
import { useSeederFactoryManager } from 'typeorm-extension';

const manager = useSeederFactoryManager();

manager.set(AccountEntityRelationDao, (faker: Faker) => {
    return AccountEntityRelationDao.create({
        id: faker.string.uuid(),
        entityType: faker.helpers.arrayElement<AccountEntityRelationType>(
            Object.values(AccountEntityRelationType),
        ),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const accountEntityRelationFactory = () => manager.get(AccountEntityRelationDao);
