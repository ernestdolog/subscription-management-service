import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';
import { PersonEntityRelationDao } from '#app/modules/person/infrastructure/index.js';
import { Faker } from '@faker-js/faker';
import { SeederFactory, useSeederFactoryManager } from 'typeorm-extension';

const manager = useSeederFactoryManager();

manager.set(PersonEntityRelationDao, (faker: Faker) => {
    return PersonEntityRelationDao.create({
        id: faker.string.uuid(),
        entityType: faker.helpers.arrayElement<PersonEntityRelationType>(
            Object.values(PersonEntityRelationType),
        ),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const personEntityRelationFactory: () => SeederFactory<
    PersonEntityRelationDao,
    unknown
> = () => manager.get(PersonEntityRelationDao);
