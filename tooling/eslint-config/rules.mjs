// Shared rule sets. Each one enforces a rule written in docs/rules/, so the docs and lint cannot drift.

const EM_DASH = String.fromCharCode(0x2014);
const EM_DASH_MESSAGE = 'No em-dashes. Use a comma, colon, full stop or brackets instead.';

const emDashSelectors = [
  { selector: `Literal[value=/${EM_DASH}/]`, message: EM_DASH_MESSAGE },
  { selector: `TemplateElement[value.raw=/${EM_DASH}/]`, message: EM_DASH_MESSAGE },
  { selector: `JSXText[value=/${EM_DASH}/]`, message: EM_DASH_MESSAGE },
];

const defaultExportSelector = {
  selector: 'ExportDefaultDeclaration',
  message: 'Named exports only. Default exports are allowed only where a framework requires them.',
};

const processEnvSelector = {
  selector: "MemberExpression[object.name='process'][property.name='env']",
  message: 'Read environment variables through the validated env module, never process.env.',
};

// A hex colour on its own ('#fff') or inside a Tailwind arbitrary value ('bg-[#fff]').
const colorLiteralSelector = {
  selector: 'Literal[value=/(^#[0-9a-fA-F]{3,8}$)|(-\\[#[0-9a-fA-F]{3,8}\\])/]',
  message: 'No hard-coded colours. Use a colour role from globals.css (bg-brand, text-muted-foreground).',
};

/**
 * `no-restricted-syntax` takes one list, so every override has to restate it.
 * This builds the list from the exceptions a file group needs.
 */
export function restrictedSyntax({
  allowDefaultExport = false,
  allowProcessEnv = false,
  forbidColorLiterals = false,
} = {}) {
  return [
    'error',
    ...emDashSelectors,
    ...(allowDefaultExport ? [] : [defaultExportSelector]),
    ...(allowProcessEnv ? [] : [processEnvSelector]),
    ...(forbidColorLiterals ? [colorLiteralSelector] : []),
  ];
}

export const namingConvention = [
  'error',
  { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
  { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
  { selector: 'function', format: ['camelCase', 'PascalCase'] },
  { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
  { selector: 'typeLike', format: ['PascalCase'] },
  { selector: 'enumMember', format: ['PascalCase'] },
  // Object keys can be database columns, HTTP headers, CSS variables and so on.
  { selector: ['objectLiteralProperty', 'typeProperty', 'objectLiteralMethod'], format: null },
  { selector: 'import', format: null },
];

/** Rules for every TypeScript file in the workspace. */
export const sharedTypeScriptRules = {
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'prefer-const': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/naming-convention': namingConvention,
};

/** Config files at a package root: tools require a default export and read process.env. */
export const CONFIG_FILE_GLOBS = ['*.config.{js,mjs,cjs,ts,mts}', '**/*.config.{js,mjs,cjs,ts,mts}'];

export const TEST_FILE_GLOBS = ['**/*.test.{ts,tsx}', '**/test/**/*.{ts,tsx}'];
