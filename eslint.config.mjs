// @ts-check
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
    {
        ignores: ['**/build', '**/dist', '**/coverage', '**/__tests__', '**/s*gql-codegen*'],
    },
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'unused-imports': unusedImports,
        },
        files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': 'error',
        },
    },
];
