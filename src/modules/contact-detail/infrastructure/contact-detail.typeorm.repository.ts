import { dataSource } from '#app/configs/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { FindOptionsWhere, FindOptionsRelations, EntityManager } from 'typeorm';
import { ContactDetailDao } from './contact-detail.dao.js';
import { addUserViewPermissionFiltertoContactDetail } from './contact-detail.user.is-viewer.js';
import { ContactDetailEntity, ContactDetailType } from '../domain/index.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';

const TypeOrmContactDetailRepository = dataSource
    .getRepository<ContactDetailDao>(ContactDetailDao)
    .extend({
        findOne(props: {
            where: FindOptionsWhere<ContactDetailDao>[] | FindOptionsWhere<ContactDetailDao>;
            relations?: FindOptionsRelations<ContactDetailDao>;
            user: User;
        }): Promise<ContactDetailDao | null> {
            const queryBuilder = this.createQueryBuilder();
            queryBuilder.where(props.where);
            queryBuilder.setFindOptions({
                relations: props.relations,
            });
            addUserViewPermissionFiltertoContactDetail(props.user, queryBuilder);
            return queryBuilder.getOne();
        },
        isEmailAlreadyTaken(email: string): Promise<boolean> {
            return this.exists({
                where: { type: ContactDetailType.EMAIL, detail: email },
            });
        },
        async getOne(id: string, user: User): Promise<ContactDetailEntity | undefined> {
            const res = await this.findOne({
                user: user,
                where: { id },
            });
            return res?.toEntity;
        },
        async preserve(id: string, input: Partial<ContactDetailEntity>) {
            const update = {
                id: input.id,
                entityType: input.entityType,
                entityId: input.entityId,
                type: input.type,
                detail: input.detail,
                tag: input.tag,
                createdAt: input.createdAt,
                createdBy: input.createdBy,
                updatedAt: input.updatedAt,
                updatedBy: input.updatedBy,
                deletedBy: input.deletedBy,
                deletedAt: input.deletedAt,
            };
            await this.update({ id }, update);
        },
        async preserveNew(
            input: Partial<ContactDetailEntity> &
                Pick<ContactDetailEntity, 'detail' | 'entityId' | 'entityType' | 'type' | 'detail'>,
            user: User,
        ) {
            const contactDetailCandidate = this.create({
                ...input,
                createdBy: user.accountId,
                updatedBy: user.accountId,
            });
            const res = await this.save(contactDetailCandidate);
            return res.toEntity;
        },
        async softDelete(
            entity: Partial<ContactDetailEntity> & Pick<ContactDetailEntity, 'id'>,
            user: User,
        ) {
            const deletedBy = {
                deletedBy: user.accountId,
                updatedBy: user.accountId,
            };
            await this.update({ id: entity.id }, deletedBy);
            Object.assign(entity, deletedBy);
            const res = await this.softRemove(entity);
            return res.toEntity;
        },
    });

export function getTypeOrmContactDetailRepository(
    manager: AbstractTransactionManager,
): typeof TypeOrmContactDetailRepository {
    if (!manager.context) return TypeOrmContactDetailRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(TypeOrmContactDetailRepository);
}
