import { ContactDetailEntityRelationType } from '#app/modules/contact-detail/domain/index.js';
import { ContactDetailEntityRelationDao } from '#app/modules/contact-detail/infrastructure/contact-detail-entity-relation.dao.js';
import { Faker } from '@faker-js/faker';
import { useSeederFactoryManager } from 'typeorm-extension';

const manager = useSeederFactoryManager();

manager.set(ContactDetailEntityRelationDao, (faker: Faker) => {
    return ContactDetailEntityRelationDao.create({
        id: faker.string.uuid(),
        entityType: faker.helpers.arrayElement<ContactDetailEntityRelationType>(
            Object.values(ContactDetailEntityRelationType),
        ),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const contactDetailEntityRelationFactory = () => manager.get(ContactDetailEntityRelationDao);
