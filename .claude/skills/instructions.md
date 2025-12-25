# Authentication Domain DDD Project Instructions

## Purpose

This project is a **live-alike Authentication Domain Collection** (multiple domains working together) for practicing:

- **Domain-Driven Design**
- **Event-Driven Architecture**
- **Node.js, TypeScript, Fastify**
- **Command Query Responsibility Segregation (CQRS)**
- **Kafka event streaming**
- Eventually **Large Language Models (LLMs)** integration (OpenAI, Claude)

It is **not a microservice** or monolith; it is an isolated, **well-structured Domain-Driven Design module collection** that can later integrate into larger systems (distributed or monolithic).

> **Important for LLMs:** All modules are designed to be **event-driven**. Commands trigger domain events, which are handled asynchronously by consumers, HTTP endpoints, or other modules. LLMs interacting with this system should respect the **event-driven flow** and **do not assume direct synchronous access to other modules**.

---

## Principles

1. **Domain-Centric**

    - Domain models are **the source of truth**.
    - All business rules live in **domain entities, aggregates, and value objects**.
    - Domain logic **never** leaks into HTTP server, Kafka, or shared utilities.

2. **Ports and Adapters Concept (without explicit adapters folder)**

    - **Modules** are framework-agnostic.
    - HTTP server, Kafka consumers, and producers live **outside modules**, e.g., in `http/` or `shared/kafka/`.
    - **Dependency direction**:
        ```
        http / shared / consumer --> modules (domain/application)
        modules --> shared (utilities, DTOs, constants)
        ```
    - **Never** the reverse.

3. **Command Query Responsibility Segregation**

    - Commands modify state and emit events.
    - Queries read state only.
    - Domain events may be published via Kafka.

4. **Event-Driven Architecture**

    - Cross-module communication occurs **via events**.
    - Kafka topics propagate events between modules.
    - Domain emits events; HTTP server or consumers handle them asynchronously.
    - LLMs interacting with this system should **produce events or react to events**, not bypass the event flow.

5. **Prevent Circular Dependencies**

    - Each module should have clear subfolders:
        ```
        modules/<module>/
          domain/
          application/
          http/   # optional, REST endpoints for this module
        ```
    - Modules may import **shared utilities**.
    - Shared utilities **cannot** import modules.

6. **Strict TypeScript and ECMAScript Modules**
    - Node.js version 24 or higher.
    - `"strict": true` in `tsconfig.json`.
    - All imports must use `.js` suffix in runtime.
    - Avoid `any` type.
    - Prefer **composition over inheritance**.

---

## Recommended Project Structure

```bash
src/
├── tests/                        # Unit and integration tests
├── consumer/                     # Kafka or other consumers
├── configs/                       # Configuration files, environment settings
├── http/                          # HTTP server setup
│   ├── context/
│   ├── health/
│   ├── routes/
│   │   └── rest.routes.ts
│   ├── swagger/
│   ├── http-server.constants.ts
│   ├── http-server.daemon.ts
│   └── index.ts
├── modules/                       # Domain and application modules
│   ├── authentication/
│   │   ├── domain/                # Domain entities, value objects, errors, events
│   │   ├── application/           # Commands, queries, handlers
│   │   └── http/                  # Optional REST endpoints for this module
│   ├── account/
│   │   ├── domain/
│   │   ├── application/
│   │   └── http/
│   ├── subscription/
│   │   ├── domain/
│   │   ├── application/
│   │   └── http/
│   ├── contact-detail/
│   └── person/
├── preload.ts                     # Bootstrapping tasks
├── shared/                        # Utilities shared across modules
│   ├── aws-ses/
│   ├── body-parse/
│   ├── email/
│   ├── kafka/
│   │   ├── client/
│   │   ├── events/
│   │   └── producer/
│   ├── logging/
│   ├── query-connection/
│   ├── transaction/
│   ├── abstract.daemon.ts
│   ├── abstract.service.ts
│   ├── authorization/
│   │   ├── plugins/
│   │   └── tool/
│   └── index.ts
├── application.ts                 # MainApplication class to provide straightforward way to setup the application
├── consumer.runnable.ts.          # entrypoint for running in consumer mode f ex nom run dev consumer
├── directory-scan.ts              # scans every files in the directory before run to make sure we have it all
├── http-server.runnable.ts        # # entrypoint for running in http-server mode f ex nom run dev http-server
└── index.ts                       # Public API
```

**Notes on structure:**

- `modules` contains all domain-focused modules. Optionally rename to `domains` for textbook Domain-Driven Design alignment.
- `shared` is a utility layer between a reusable package and project-specific code.
- HTTP server is centralized in `http/`.
- Consumers and Kafka producers live outside modules but use module events and shared utilities.
- Modules do not contain framework-specific logic except optional REST endpoints.

---

## Coding Guidelines

1. **Single Responsibility**

    - One class or file per clear responsibility.
    - Name files explicitly: `user.entity.ts`, `register-user.command.ts`.

2. **Explicit Exports**

    - Only expose what is needed outside the module.
    - Keep internal logic private.

3. **Safe Dependencies**

    - Modules: no external libraries, only TypeScript and shared utilities.
    - HTTP, consumer, and producer code may use libraries for integration.

4. **Validation and Defensive Programming**

    - Value objects validate input at construction.
    - Commands validate business rules before execution.
    - Handle errors explicitly.

5. **Event-Driven**

    - Domain emits events; HTTP server, consumers, and producers handle delivery asynchronously.
    - Commands do **not** call HTTP server or consumers directly.
    - Large Language Models interacting with this system must respect event flows.

6. **Command Query Responsibility Segregation**

    - Commands → Domain → Event → Kafka.
    - Queries → Read models inside modules.
    - Keep read and write paths separate.

7. **Testing**
    - Modules: unit tests.
    - Application handlers: command and query handler tests.
    - HTTP server and consumers: integration tests.

---

## Hooks and Post-Prompt Validation

- Run `post-prompt-finetune` **after any code generation**.
- Ensure:
    - No circular imports.
    - Modules depend on shared utilities only in the correct direction.
    - All exports are explicit.
    - ECMAScript Module imports use `.js` suffix.

---

## Future Large Language Model Integration

- Keep modules **framework-agnostic**.
- Expose commands and queries as plain **data transfer objects**.
- Large Language Models should interact via **events** rather than bypassing domain or application logic.
- LLM orchestration or agents can subscribe to domain events, emit commands, and respond asynchronously.

> **Important for Large Language Models:** Always respect the **event-driven architecture**, **Command Query Responsibility Segregation patterns**, and **domain rules**. LLMs should not make direct synchronous calls into other modules; instead, they produce commands and respond to events.
