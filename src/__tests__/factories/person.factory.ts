import { PersonDao } from '#app/modules/person/infrastructure/index.js';
import { Faker } from '@faker-js/faker';
import { SeederFactory, useSeederFactoryManager } from 'typeorm-extension';

const manager = useSeederFactoryManager();

manager.set(PersonDao, (faker: Faker) => {
    return PersonDao.create({
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const personFactory: () => SeederFactory<PersonDao, unknown> = () => manager.get(PersonDao);
