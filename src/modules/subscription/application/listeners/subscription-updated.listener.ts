import { Static, Type } from '@sinclair/typebox';
import { AbstractEventListener, AbstractEventDto } from '#app/shared/event-listener/index.js';
import { EventEntityType, EventType } from '#app/shared/kafka/events/kafka.event.enum.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/domain/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';

export const SubscriptionUpdatedEvent = Type.Intersect([
    AbstractEventDto,
    Type.Object({
        subscriptionId: Type.String(),
        name: Type.String(),
        createdAt: Type.String(),
        createdBy: Type.Optional(Type.String()),
        updatedAt: Type.String(),
        updatedBy: Type.String(),
    }),
]);

export type SubscriptionUpdatedEvent = Static<typeof SubscriptionUpdatedEvent>;

export class SubscriptionUpdatedListener extends AbstractEventListener<SubscriptionUpdatedEvent> {
    protected get listenerName(): string {
        return 'SubscriptionUpdatedListener';
    }

    protected filter(event: AbstractEventDto): event is SubscriptionUpdatedEvent {
        return event.type === EventType.UPDATE && event.entityType === EventEntityType.SUBSCRIPTION;
    }

    protected async execute(event: SubscriptionUpdatedEvent): Promise<void> {
        const log = this.log.child({ subscriptionId: event.subscriptionId });
        log.info('Processing subscription updated event');

        const existing = await this.subscriptionRepository.getOneWithRelations(
            event.subscriptionId,
        );

        const isUpdateReflected =
            existing?.id === event.subscriptionId &&
            existing?.name === event.name &&
            existing?.createdAt.toString() === event.createdAt &&
            existing?.createdBy === event.createdBy &&
            existing?.updatedAt.toString() === event.updatedAt &&
            existing?.updatedBy === event.updatedBy;

        if (existing && !isUpdateReflected) {
            const updated = existing.update(event, {
                accountId: event.updatedBy,
            } as User);
            await this.subscriptionRepository.preserve(event.subscriptionId, updated);

            log.info('Subscription updated');
            return;
        }

        log.info('Subscription already up to date');
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.transactionManager);
    }
}
