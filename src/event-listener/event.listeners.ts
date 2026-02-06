import { AbstractEventListener } from '#app/shared/event-listener/index.js';
import { SubscriptionCreatedListener } from '#app/modules/subscription/application/listeners/subscription-created.listener.js';
import { SubscriptionUpdatedListener } from '#app/modules/subscription/application/listeners/subscription-updated.listener.js';

export const EventListeners: AbstractEventListener[] = [
    new SubscriptionCreatedListener(),
    new SubscriptionUpdatedListener(),
];
