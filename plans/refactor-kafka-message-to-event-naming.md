# Refactor: Rename Kafka Message Constructs to Event

**Type:** ♻️ refactor
**Created:** 2025-12-24
**Status:** Draft

## Overview

Rename all Kafka event-related constructs from "message" to "event" terminology, and rename handlers to use past tense with `.event-handler` suffix for better semantic clarity and consistency.

## Problem Statement / Motivation

The current codebase uses "message" terminology for Kafka event constructs, but "event" is more semantically accurate for domain events that represent business facts. Additionally, there's an existing naming inconsistency:

- `subscription.created.event-handler.ts` exports `SubscriptionCreatedEventHandler`
- But imported as `SubscriptionCreateMessageHandler` in `consumer.payload.ts`
- Logger still uses `'SubscriptionCreateMessageHandler'`

This refactoring will:

1. Align terminology with event-driven architecture best practices
2. Use past tense for events (representing completed business facts)
3. Fix existing inconsistencies
4. Improve code clarity and maintainability

## Scope & Constraints

**In Scope:**

- Rename files, classes, types, and variables related to Kafka event constructs
- Only Kafka-related constructs (not general application code)

**Out of Scope (CRITICAL - Do NOT change):**

- ❌ Kafka topic string values (`'subscriptions-subscription-create'`) - would break existing topics
- ❌ `EventType` enum values (`CREATE`, `UPDATE`, `DELETE`) - would break message serialization
- ❌ KafkaJS library types (`Message`, `ProducerRecord`) - external library
- ❌ `EventEntityType` enum values - already correctly named

## Technical Approach

### File Renames Summary

| Current Path                                                                  | New Path                                                                     |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/shared/kafka/messages/`                                                  | `src/shared/kafka/events/`                                                   |
| `src/shared/kafka/messages/abstract.kafka.message.ts`                         | `src/shared/kafka/events/abstract.kafka.event.ts`                            |
| `src/shared/kafka/messages/kafka.message.dto.ts`                              | `src/shared/kafka/events/kafka.event.dto.ts`                                 |
| `src/shared/kafka/messages/kafka.message.enum.ts`                             | `src/shared/kafka/events/kafka.event.enum.ts`                                |
| `src/shared/kafka/messages/kafka.message.error.ts`                            | `src/shared/kafka/events/kafka.event.error.ts`                               |
| `src/shared/kafka/messages/v1/subscriptions-subscription-create/`             | `src/shared/kafka/events/v1/subscriptions-subscription-created/`             |
| `src/shared/kafka/messages/v1/subscriptions-subscription-update/`             | `src/shared/kafka/events/v1/subscriptions-subscription-updated/`             |
| `.../subscriptions-subscription-create.dto.ts`                                | `.../subscriptions-subscription-created.dto.ts`                              |
| `.../subscriptions-subscription-create.message.ts`                            | `.../subscriptions-subscription-created.event.ts`                            |
| `.../subscriptions-subscription-update.dto.ts`                                | `.../subscriptions-subscription-updated.dto.ts`                              |
| `.../subscriptions-subscription-update.message.ts`                            | `.../subscriptions-subscription-updated.event.ts`                            |
| `src/shared/producers/producer.ts`                                            | (keep file, rename class inside)                                             |
| `src/modules/subscription/application/subscription.update-message.handler.ts` | `src/modules/subscription/application/subscription.updated.event-handler.ts` |

### Class/Type Renames Summary

| Current Name                             | New Name                                |
| ---------------------------------------- | --------------------------------------- |
| `AbstractKafkaMessage`                   | `AbstractKafkaEvent`                    |
| `AbstractKafkaMessageDto`                | `AbstractKafkaEventDto`                 |
| `KafkaMessageError`                      | `KafkaEventError`                       |
| `MessageVersion`                         | `EventVersion`                          |
| `SubscriptionsSubscriptionCreateMessage` | `SubscriptionsSubscriptionCreatedEvent` |
| `SubscriptionsSubscriptionCreateDto`     | `SubscriptionsSubscriptionCreatedDto`   |
| `SubscriptionsSubscriptionUpdateMessage` | `SubscriptionsSubscriptionUpdatedEvent` |
| `SubscriptionsSubscriptionUpdateDto`     | `SubscriptionsSubscriptionUpdatedDto`   |
| `SubscriptionUpdateMessageHandler`       | `SubscriptionUpdatedEventHandler`       |
| `MessageProducer`                        | `EventProducer`                         |
| `messageProducer`                        | `eventProducer`                         |

### Export Namespace Change

```typescript
// Before
import { messages } from '#app/shared/kafka/index.js';
messages.v1.SubscriptionsSubscriptionCreateMessage;

// After
import { events } from '#app/shared/kafka/index.js';
events.v1.SubscriptionsSubscriptionCreatedEvent;
```

---

## Implementation Phases

### Phase 1: Fix Existing Inconsistency

**Files to update:**

1. `src/consumer/consumer.payload.ts:5` - Fix import name

    ```typescript
    // Before
    import { SubscriptionCreateMessageHandler } from ...

    // After
    import { SubscriptionCreatedEventHandler } from ...
    ```

2. `src/modules/subscription/application/subscription.created.event-handler.ts:53` - Fix logger class name

    ```typescript
    // Before
    cls: 'SubscriptionCreateMessageHandler';

    // After
    cls: 'SubscriptionCreatedEventHandler';
    ```

3. `src/modules/subscription/application/index.ts` - Update export name

### Phase 2: Rename Base Classes & Types

**Files:**

1. **Rename folder:** `src/shared/kafka/messages/` → `src/shared/kafka/events/`

2. **`abstract.kafka.message.ts` → `abstract.kafka.event.ts`:**

    - Class: `AbstractKafkaMessage` → `AbstractKafkaEvent`
    - Type: `MessageVersion` → `EventVersion`
    - Update JSDoc comments

3. **`kafka.message.dto.ts` → `kafka.event.dto.ts`:**

    - Export: `AbstractKafkaMessageDto` → `AbstractKafkaEventDto`

4. **`kafka.message.enum.ts` → `kafka.event.enum.ts`:**

    - Keep enum VALUES unchanged (Topic values, EventType values)
    - Only file name changes

5. **`kafka.message.error.ts` → `kafka.event.error.ts`:**

    - Class: `KafkaMessageError` → `KafkaEventError`
    - Property: `MESSAGE_VALIDATION` → `EVENT_VALIDATION`

6. **`src/shared/kafka/events/index.ts`:**

    - Update: `export * as v1` stays same structure
    - Namespace export changes from `messages` to `events`

7. **`src/shared/kafka/index.ts`:**
    - Update: `export * as messages` → `export * as events`

### Phase 3: Rename Event Classes (v1)

**Subscription Create:**

1. **Rename folder:** `v1/subscriptions-subscription-create/` → `v1/subscriptions-subscription-created/`

2. **`subscriptions-subscription-create.dto.ts` → `subscriptions-subscription-created.dto.ts`:**

    - Schema: `SubscriptionsSubscriptionCreateDto` → `SubscriptionsSubscriptionCreatedDto`

3. **`subscriptions-subscription-create.message.ts` → `subscriptions-subscription-created.event.ts`:**

    - Class: `SubscriptionsSubscriptionCreateMessage` → `SubscriptionsSubscriptionCreatedEvent`

4. **Update `v1/subscriptions-subscription-created/index.ts`**

**Subscription Update:**

1. **Rename folder:** `v1/subscriptions-subscription-update/` → `v1/subscriptions-subscription-updated/`

2. **`subscriptions-subscription-update.dto.ts` → `subscriptions-subscription-updated.dto.ts`:**

    - Schema: `SubscriptionsSubscriptionUpdateDto` → `SubscriptionsSubscriptionUpdatedDto`

3. **`subscriptions-subscription-update.message.ts` → `subscriptions-subscription-updated.event.ts`:**

    - Class: `SubscriptionsSubscriptionUpdateMessage` → `SubscriptionsSubscriptionUpdatedEvent`

4. **Update `v1/subscriptions-subscription-updated/index.ts`**

5. **Update `v1/index.ts`** - export paths

### Phase 4: Rename Handlers

1. **`subscription.update-message.handler.ts` → `subscription.updated.event-handler.ts`:**

    - Class: `SubscriptionUpdateMessageHandler` → `SubscriptionUpdatedEventHandler`
    - Logger cls: `'SubscriptionUpdateMessageHandler'` → `'SubscriptionUpdatedEventHandler'`
    - Parameter: `message:` → `event:` (optional but recommended)
    - Update type reference to new event class name

2. **`subscription.created.event-handler.ts`:** (already correct filename)

    - Parameter: `message:` → `event:` (optional but recommended)
    - Update type reference to new event class name

3. **`src/modules/subscription/application/index.ts`:**
    - Update exports for both handlers

### Phase 5: Rename Producer

1. **`src/shared/producers/producer.ts`:**

    - Class: `MessageProducer` → `EventProducer`
    - Export: `messageProducer` → `eventProducer`

2. **`src/shared/kafka/producer/abstract.kafka.producer.ts`:**
    - Update generic constraint from `AbstractKafkaMessage` → `AbstractKafkaEvent`
    - Keep class name as `AbstractKafkaProducer` (already clear)

### Phase 6: Update Consumer

1. **`src/consumer/consumer.payload.ts`:**

    - Import from new event paths
    - Getter: `get message()` → `get event()`
    - Update switch cases to use new event class names
    - Update handler imports

2. **`src/consumer/consumer.daemon.ts`:**
    - Update `consumerPayload.message` → `consumerPayload.event`
    - Update logging references

### Phase 7: Update All Import Paths

Files that need import updates:

1. `src/shared/kafka/index.ts`
2. `src/shared/kafka/events/index.ts`
3. `src/shared/kafka/events/v1/index.ts`
4. `src/shared/kafka/producer/index.ts`
5. `src/shared/kafka/producer/abstract.kafka.producer.ts`
6. `src/shared/producers/producer.ts`
7. `src/consumer/consumer.daemon.ts`
8. `src/consumer/consumer.payload.ts`
9. `src/modules/subscription/application/subscription.created.event-handler.ts`
10. `src/modules/subscription/application/subscription.updated.event-handler.ts`
11. `src/modules/subscription/application/index.ts`
12. Any handlers that publish events (search for `messageProducer`)

### Phase 8: Update Tests

1. **`src/__tests__/integration/subscription-create.consumer.test.ts`:**

    - Update imports to use new event classes
    - Update variable names from `message` to `event`
    - Update mock references

2. **`src/__tests__/integration/subscription-update.consumer.test.ts`:**

    - Same updates as above

3. **`src/__tests__/factories/kafka-payload.factory.ts`:**
    - Update parameter type from `AbstractKafkaMessage` → `AbstractKafkaEvent`
    - Keep function name (creates Kafka payload, not event)

---

## Acceptance Criteria

### Functional Requirements

- [ ] All Kafka event classes renamed from `*Message` to `*Event`
- [ ] All handlers renamed to `*.event-handler.ts` with past tense
- [ ] Export namespace changed from `messages` to `events`
- [ ] Producer renamed from `messageProducer` to `eventProducer`
- [ ] No references to old class names remain in codebase

### Non-Functional Requirements

- [ ] All existing tests pass
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] No breaking changes to Kafka topic names or message format

### Quality Gates

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] Manual verification: consumer can still process existing messages

---

## Files Changed Summary

```
src/shared/kafka/
├── events/                                          # RENAMED from messages/
│   ├── abstract.kafka.event.ts                      # RENAMED + class changes
│   ├── kafka.event.dto.ts                           # RENAMED + export changes
│   ├── kafka.event.enum.ts                          # RENAMED (values unchanged!)
│   ├── kafka.event.error.ts                         # RENAMED + class changes
│   ├── index.ts                                     # UPDATED exports
│   └── v1/
│       ├── subscriptions-subscription-created/      # RENAMED from *-create
│       │   ├── subscriptions-subscription-created.dto.ts
│       │   ├── subscriptions-subscription-created.event.ts
│       │   └── index.ts
│       ├── subscriptions-subscription-updated/      # RENAMED from *-update
│       │   ├── subscriptions-subscription-updated.dto.ts
│       │   ├── subscriptions-subscription-updated.event.ts
│       │   └── index.ts
│       └── index.ts
├── producer/
│   ├── abstract.kafka.producer.ts                   # UPDATED type refs
│   └── index.ts
└── index.ts                                         # UPDATED: messages → events

src/shared/producers/
└── producer.ts                                      # Class: EventProducer

src/consumer/
├── consumer.daemon.ts                               # UPDATED refs
└── consumer.payload.ts                              # UPDATED: message → event

src/modules/subscription/application/
├── subscription.created.event-handler.ts            # UPDATED type refs + logger
├── subscription.updated.event-handler.ts            # RENAMED from *-message.handler
└── index.ts                                         # UPDATED exports

src/__tests__/
├── integration/
│   ├── subscription-create.consumer.test.ts         # UPDATED imports
│   └── subscription-update.consumer.test.ts         # UPDATED imports
└── factories/
    └── kafka-payload.factory.ts                     # UPDATED type refs
```

---

## Risk Analysis & Mitigation

| Risk                         | Impact   | Mitigation                                                   |
| ---------------------------- | -------- | ------------------------------------------------------------ |
| Breaking Kafka compatibility | CRITICAL | Do NOT change topic string values or EventType enum values   |
| Missing import updates       | HIGH     | Use TypeScript compiler to catch errors; run full test suite |
| Runtime errors               | HIGH     | Run integration tests before merge                           |
| Other services affected      | MEDIUM   | This is internal refactoring; message format unchanged       |

---

## References

### Internal References

- `src/shared/kafka/messages/abstract.kafka.message.ts:1-85` - Base class
- `src/shared/kafka/messages/kafka.message.enum.ts:1-15` - Topic/EventType enums
- `src/consumer/consumer.payload.ts:1-51` - Payload routing
- `src/consumer/consumer.daemon.ts:1-102` - Consumer daemon

### External References

- [KafkaJS Documentation](https://github.com/tulios/kafkajs)
- [Event-Driven Architecture Best Practices](https://developer.confluent.io/courses/event-design/best-practices/)
- [Domain Events Naming](https://khalilstemmler.com/articles/typescript-domain-driven-design/chain-business-logic-domain-events/)

---

## MVP Implementation Order

Execute in this order to minimize broken state:

1. **Phase 1:** Fix existing inconsistency (SubscriptionCreatedEventHandler)
2. **Phase 2:** Rename base classes and folder structure
3. **Phase 3:** Rename event classes (v1)
4. **Phase 4:** Rename handlers
5. **Phase 5:** Rename producer
6. **Phase 6:** Update consumer
7. **Phase 7:** Update all remaining imports
8. **Phase 8:** Update tests
9. **Validation:** Build, lint, test

---

_🤖 Generated with [Claude Code](https://claude.com/claude-code)_
