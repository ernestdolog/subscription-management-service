import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, it } from 'node:test';

/**
 * Module boundary meta-test (DDD Exemplar 4).
 *
 * Proves the dependency-cruiser guardrail actually fires on a forbidden cross-module
 * import — and, just as importantly, that the CORRECTED `no-app-to-foreign-infrastructure`
 * rule does NOT flag the legitimate ports/adapters wiring (an application handler importing
 * a foreign module's `domain` for the repository interface + getXRepository factory).
 *
 * It drives the real `depcruise` CLI (not the Node API — the CLI does the tsconfig->resolver
 * threading that maps #app/* to ./src/*) against the real module tree and reads its JSON.
 */
type CruiseViolation = { rule: { name: string } };

describe('module boundaries (dependency-cruiser)', { concurrency: true }, () => {
    const root = process.cwd();
    const bin = join(root, 'node_modules/dependency-cruiser/bin/dependency-cruise.mjs');

    let cached: CruiseViolation[] | undefined;
    const violations = (): CruiseViolation[] => {
        if (cached === undefined) {
            const stdout = execFileSync(
                process.execPath,
                [
                    bin,
                    'src/modules',
                    '--config',
                    '.dependency-cruiser.cjs',
                    '--output-type',
                    'json',
                ],
                { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
            );
            cached = (JSON.parse(stdout).summary.violations as CruiseViolation[]) ?? [];
        }
        return cached;
    };

    const countOf = (ruleName: string): number =>
        violations().filter(violation => violation.rule.name === ruleName).length;

    it('catches a forbidden domain -> foreign-domain import', () => {
        assert.ok(
            countOf('no-cross-module-domain') > 0,
            'expected dependency-cruiser to flag a module domain importing another module',
        );
    });

    it('allows application -> foreign domain (the port), forbidding only foreign infrastructure', () => {
        assert.equal(
            countOf('no-app-to-foreign-infrastructure'),
            0,
            'the ports/adapters seam (application importing a foreign domain interface) must NOT be flagged',
        );
    });
});
