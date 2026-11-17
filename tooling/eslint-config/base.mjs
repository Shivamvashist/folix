// ESLint config for plain TypeScript packages (packages/*).
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

import { CONFIG_FILE_GLOBS, TEST_FILE_GLOBS, restrictedSyntax, sharedTypeScriptRules } from './rules.mjs';

export default defineConfig([
  globalIgnores(['dist/**', 'coverage/**', '.turbo/**', 'migrations/**']),
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx,mts}'],
    rules: {
      ...sharedTypeScriptRules,
      'no-restricted-syntax': restrictedSyntax(),
    },
  },
  {
    files: CONFIG_FILE_GLOBS,
    rules: {
      'no-restricted-syntax': restrictedSyntax({ allowDefaultExport: true, allowProcessEnv: true }),
    },
  },
  {
    files: TEST_FILE_GLOBS,
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  prettier,
]);
