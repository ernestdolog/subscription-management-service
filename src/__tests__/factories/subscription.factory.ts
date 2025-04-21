import { SubscriptionDao } from '#app/modules/subscription/infrastructure/index.js';
import { Faker } from '@faker-js/faker';
import { useSeederFactoryManager } from 'typeorm-extension';

const manager = useSeederFactoryManager();

manager.set(SubscriptionDao, (faker: Faker) => {
    return SubscriptionDao.create({
        id: faker.string.uuid(),
        name: faker.company.name(),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const subscriptionFactory = () => manager.get(SubscriptionDao);
