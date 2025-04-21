import {
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { ContactDetailDao } from '#app/modules/contact-detail/infrastructure/index.js';
import { Faker } from '@faker-js/faker';
import { useSeederFactoryManager } from 'typeorm-extension';

const manager = useSeederFactoryManager();

manager.set(ContactDetailDao, (faker: Faker) => {
    return ContactDetailDao.create({
        id: faker.string.uuid(),
        entityType: faker.helpers.arrayElement<ContactDetailEntityType>(
            Object.values(ContactDetailEntityType),
        ),
        entityId: faker.string.uuid(),
        type: faker.helpers.arrayElement<ContactDetailType>(Object.values(ContactDetailType)),
        detail: faker.phone.number(),
        tag: faker.helpers.arrayElement<ContactDetailTag>(Object.values(ContactDetailTag)),
        createdAt: faker.date.past({ years: 1, refDate: new Date() }),
        createdBy: faker.string.uuid(),
        updatedAt: faker.date.past({ years: 1, refDate: new Date() }),
        updatedBy: faker.string.uuid(),
    });
});

export const contactDetailFactory = () => manager.get(ContactDetailDao);
