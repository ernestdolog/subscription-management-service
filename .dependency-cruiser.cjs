// @ts-check
/**
 * dependency-cruiser — module boundary enforcement (DDD Exemplar 4).
 *
 * Ships at `warn`: the codebase already violates several of these rules (the two
 * cross-module ORM cycles, the three application -> authentication edges, three
 * domain -> foreign-domain edges). The value is the guardrail against NEW
 * violations plus a visible backlog; flipping any rule to `error` would require
 * breaking the cross-module @OneToMany relations first (a real refactor).
 *
 * #app/* alias resolution: tsconfig `paths` maps it to ./src/*, while package.json
 * `imports` maps it to ./build/* (compiled output, gitignored). Passing
 * `tsConfig.fileName` makes dependency-cruiser resolve #app/* via the tsconfig
 * `paths` (./src/*) — verified: it takes precedence over the package.json `imports`
 * map. Without it every rule would silently match nothing against a non-existent
 * build/ tree and the whole guardrail would no-op while looking green.
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-cross-module-domain',
            severity: 'warn',
            comment:
                "A module's domain layer must stay independent — it must not import another module. " +
                'Known backlog: subscription/domain, account/domain, person/domain each import a sibling domain.',
            from: { path: '^src/modules/([^/]+)/domain/' },
            to: {
                path: '^src/modules/([^/]+)/',
                pathNot: '^src/modules/$1/',
            },
        },
        {
            name: 'no-app-to-foreign-app',
            severity: 'warn',
            comment:
                "An application handler must not call another module's application layer directly — " +
                'orchestrate through the domain port instead. Known backlog: 3 edges into authentication.',
            from: { path: '^src/modules/([^/]+)/application/' },
            to: {
                path: '^src/modules/([^/]+)/application/',
                pathNot: '^src/modules/$1/',
            },
        },
        {
            name: 'no-app-to-foreign-infrastructure',
            severity: 'warn',
            comment:
                "An application handler MAY import a foreign module's domain (the repository interface + " +
                'getXRepository factory — the ports/adapters seam this repo uses), but must NOT reach past ' +
                'the port into a foreign infrastructure adapter (concrete DAO / typeorm repository).',
            from: { path: '^src/modules/([^/]+)/application/' },
            to: {
                path: '^src/modules/([^/]+)/infrastructure/',
                pathNot: '^src/modules/$1/',
            },
        },
        {
            name: 'no-module-cycles',
            severity: 'warn',
            comment:
                'No circular dependencies between module domain/infrastructure layers. Known backlog: the ' +
                'person<->contact-detail and account<->subscription ORM cycles (baked into @OneToMany/' +
                '@ManyToOne across module DAOs). The http presentation layer has its own dense web of ' +
                'response-type cross-references — a separate concern — so it is excluded here to keep this ' +
                'rule a focused guardrail rather than a 130-entry wall of noise.',
            from: { path: '^src/modules/', pathNot: '/http/' },
            to: { circular: true, pathNot: '/http/' },
        },
    ],
    options: {
        doNotFollow: { path: 'node_modules' },
        includeOnly: '^src/',
        tsConfig: { fileName: 'tsconfig.json' },
        tsPreCompilationDeps: true,
        enhancedResolveOptions: {
            extensions: ['.ts', '.js'],
        },
    },
};
