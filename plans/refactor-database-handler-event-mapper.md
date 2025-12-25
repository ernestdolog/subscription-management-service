# Refactor: Database Folder, Abstract Handler & Domain Event Mappers

**Type:** ♻️ Refactor
**Date:** 2025-12-25
**Complexity:** Medium

---

## Overview

Three related refactoring tasks to improve code organization and DDD alignment:

1. **Move migrations to database folder** - Group database concerns together
2. **Rename AbstractService to AbstractHandler** - Fix misleading naming
3. **Create domain event mappers** - Add proper entity-to-event mapping in domain layer

---

## Problem Statement / Motivation

### 1. Migrations Location Confusion

The `src/migrations/` folder at the root of `src/` is ambiguous - "what migrations?" The folder contains **database migrations** and should be grouped with other database concerns for clarity.

### 2. Misleading AbstractService Naming

`src/shared/abstract.service.ts` contains `AbstractService` class, but it's actually a base class for **handlers** (command/query/event handlers). The name "Service" is misleading in a DDD context where services have different semantics.

### 3. Missing Domain Event Mappers

Domain events are constructed inline in handlers with direct knowledge of event DTOs. According to DDD principles, entity-to-event mapping should be encapsulated in the domain layer, making the domain model responsible for how it represents itself in events.

---

## Proposed Solution

### Task 1: Move Migrations to Database Folder

**Create new structure:**

```
src/
  database/
    migrations/
      1744917689309-initial-migration.ts
```

**Files to modify:**

| File                               | Change                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `src/configs/typeorm.config.ts:18` | Change `/migrations/**/*.{js,ts}` → `/database/migrations/**/*.{js,ts}` |
| `package.json`                     | Update `typeorm:generate` script path                                   |

### Task 2: Rename AbstractService to AbstractHandler

**Rename:**

- File: `src/shared/abstract.service.ts` → `src/shared/abstract.handler.ts`
- Class: `AbstractService` → `AbstractHandler`

**Files requiring import updates (17 files):**

| Module             | Files                                                                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **subscription**   | `subscription.create.handler.ts`, `subscription.update.handler.ts`, `subscription.retrieve.handler.ts`, `subscription.created.event-handler.ts`, `subscription.updated.event-handler.ts`                 |
| **account**        | `account.create.handler.ts`, `account.delete.handler.ts`, `account.retrieve.handler.ts`, `account.update-me.handler.ts`, `person-account.send-invitation.handler.ts`, `person-account.verify.handler.ts` |
| **person**         | `person.retrieve.handler.ts`, `person.update.handler.ts`                                                                                                                                                 |
| **contact-detail** | `contact-detail.update.handler.ts`                                                                                                                                                                       |
| **consumer**       | `consumer.payload.ts`                                                                                                                                                                                    |
| **tests**          | `test.global.runner.ts`, `abstract.service.integration.test.ts`                                                                                                                                          |

### Task 3: Create Domain Event Mappers

**New file:** `src/modules/subscription/domain/subscription.entity.event-mapper.ts`

**Pattern:**

```typescript
// subscription.entity.event-mapper.ts
import { SubscriptionEntity } from './subscription.entity.js';
import { EventEntityType, EventType } from '#app/shared/kafka/events/kafka.event.enum.js';
import { events } from '#app/shared/kafka/index.js';

export class SubscriptionEntityEventMapper {
    static toCreatedEvent(
        entity: SubscriptionEntity,
    ): events.v1.SubscriptionsSubscriptionCreatedEvent {
        return new events.v1.SubscriptionsSubscriptionCreatedEvent({
            type: EventType.CREATE,
            entityType: EventEntityType.SUBSCRIPTION,
            entityId: entity.id,
            subscriptionId: entity.id,
            name: entity.name,
            updatedAt: entity.updatedAt.toString(),
            updatedBy: entity.updatedBy,
            createdAt: entity.createdAt.toString(),
            createdBy: entity.createdBy,
        });
    }

    static toUpdatedEvent(
        entity: SubscriptionEntity,
    ): events.v1.SubscriptionsSubscriptionUpdatedEvent {
        return new events.v1.SubscriptionsSubscriptionUpdatedEvent({
            type: EventType.UPDATE,
            entityType: EventEntityType.SUBSCRIPTION,
            entityId: entity.id,
            subscriptionId: entity.id,
            name: entity.name,
            updatedAt: entity.updatedAt.toString(),
            updatedBy: entity.updatedBy,
            createdAt: entity.createdAt.toString(),
            createdBy: entity.createdBy,
        });
    }
}
```

**Handlers to refactor:**

- `src/modules/subscription/application/subscription.create.handler.ts:83-94`
- `src/modules/subscription/application/subscription.update.handler.ts`

---

## Technical Considerations

### TypeORM Migration Path Configuration

Current configuration in `src/configs/typeorm.config.ts`:

```typescript
migrations: [DirectoryScan.baseDir + '/migrations/**/*.{js,ts}'],
```

TypeORM tracks migrations by **class name + timestamp**, not file path. Moving the folder will NOT cause migrations to re-run as long as the migration class names remain unchanged.

### Build Output Structure

TypeScript compilation will automatically mirror the new structure:

- Source: `src/database/migrations/*.ts`
- Output: `build/database/migrations/*.js`

No changes needed to `tsconfig.json` - standard compilation preserves directory structure.

### Import Path Updates

All imports use the `#app/*` alias pattern:

```typescript
// Before
import { AbstractService } from '#app/shared/abstract.service.js';

// After
import { AbstractHandler } from '#app/shared/abstract.handler.js';
```

---

## Acceptance Criteria

### Task 1: Migrations Folder

- [ ] Directory `src/database/migrations/` exists
- [ ] All migration files moved to new location
- [ ] `npm run typeorm:migrate` executes successfully
- [ ] `npm run typeorm:generate -- TestMigration` creates file in new location
- [ ] `npm run build` compiles migrations correctly
- [ ] Git history preserved for moved files

### Task 2: AbstractHandler Rename

- [ ] File renamed: `abstract.service.ts` → `abstract.handler.ts`
- [ ] Class renamed: `AbstractService` → `AbstractHandler`
- [ ] All 17 importing files updated
- [ ] Test file renamed: `abstract.service.integration.test.ts` → `abstract.handler.integration.test.ts`
- [ ] `npm run build` succeeds with no errors
- [ ] `npm test` passes

### Task 3: Event Mappers

- [ ] `subscription.entity.event-mapper.ts` created in domain layer
- [ ] Exported from `src/modules/subscription/domain/index.ts`
- [ ] `subscription.create.handler.ts` refactored to use mapper
- [ ] `subscription.update.handler.ts` refactored to use mapper
- [ ] Events publish correctly (verified in tests)

---

## Implementation Phases

### Phase 1: Event Mapper (Lowest Risk)

1. Create `subscription.entity.event-mapper.ts`
2. Export from domain index
3. Refactor `subscription.create.handler.ts` to use mapper
4. Refactor `subscription.update.handler.ts` to use mapper
5. Run tests
6. Commit: `refactor(subscription): add domain event mapper`

### Phase 2: AbstractHandler Rename (Medium Risk)

1. Rename file using `git mv`
2. Update class name and generics
3. Update all 17 import statements
4. Rename test file
5. Run full test suite
6. Commit: `refactor(shared): rename AbstractService to AbstractHandler`

### Phase 3: Database Folder (Highest Risk)

1. Create `src/database/` directory
2. Move migrations using `git mv`
3. Update `typeorm.config.ts` migration path
4. Update `package.json` script
5. Test migration commands
6. Commit: `refactor(database): move migrations to database folder`

---

## File Changes Summary

| Task | Action | File                                                                  |
| ---- | ------ | --------------------------------------------------------------------- |
| 1    | Create | `src/database/` directory                                             |
| 1    | Move   | `src/migrations/*` → `src/database/migrations/*`                      |
| 1    | Edit   | `src/configs/typeorm.config.ts`                                       |
| 1    | Edit   | `package.json`                                                        |
| 2    | Rename | `src/shared/abstract.service.ts` → `src/shared/abstract.handler.ts`   |
| 2    | Edit   | 17 handler/test files (import updates)                                |
| 3    | Create | `src/modules/subscription/domain/subscription.entity.event-mapper.ts` |
| 3    | Edit   | `src/modules/subscription/domain/index.ts`                            |
| 3    | Edit   | `src/modules/subscription/application/subscription.create.handler.ts` |
| 3    | Edit   | `src/modules/subscription/application/subscription.update.handler.ts` |

---

## References

### Internal References

- TypeORM config: `src/configs/typeorm.config.ts:18`
- AbstractService: `src/shared/abstract.service.ts:11-27`
- Subscription entity: `src/modules/subscription/domain/subscription.entity.ts`
- Event creation pattern: `src/modules/subscription/application/subscription.create.handler.ts:83-94`
- Kafka events: `src/shared/kafka/events/v1/`

### Best Practices

- [TypeORM Migrations Documentation](https://typeorm.io/docs/advanced-topics/migrations/)
- [DDD Domain Events - Khalil Stemmler](https://khalilstemmler.com/articles/typescript-domain-driven-design/chain-business-logic-domain-events/)
- [Clean Architecture with TypeScript](https://bazaglia.com/clean-architecture-with-typescript-ddd-onion/)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
