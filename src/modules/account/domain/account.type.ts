import { PersonEntity } from '#app/modules/person/domain/index.js';
import { UserEntityType } from '#app/shared/authorization/tool/index.js';

export type AccountEntityType = {
    [UserEntityType.PERSON]: PersonEntity;
};
