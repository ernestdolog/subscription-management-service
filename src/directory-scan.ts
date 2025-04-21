import glob from 'glob-promise';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export class DirectoryScan {
    readonly baseDir: string;

    constructor(private readonly patterns: string[]) {
        const __filename = fileURLToPath(import.meta.url);
        this.baseDir = path.dirname(__filename);
    }

    static get baseDir(): string {
        const __filename = fileURLToPath(import.meta.url);
        return path.dirname(__filename);
    }

    async execute() {
        this.patterns.forEach(async pattern => {
            const paths = await glob(pattern, { cwd: this.baseDir });
            paths.forEach((filePath: string) => import(this.baseDir + '/' + filePath));
        });
    }
}
