// Conventional Commits. Scopes match the workspace layout (docs/rules/08-git-workflow.md).
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['web', 'schema', 'db', 'ai', 'templates', 'tooling', 'docs', 'ci', 'deps', 'repo'],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'header-max-length': [2, 'always', 100],
  },
};

export default config;
