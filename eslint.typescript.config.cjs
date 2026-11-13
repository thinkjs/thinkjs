const tseslint = require('typescript-eslint');

// Separate, opt-in configuration: legacy JavaScript keeps eslint.config.cjs.
// Semantic correctness is checked by tsc, not a second ESLint TS Program.
module.exports = [
  {ignores: ['**/node_modules/**', '**/coverage/**', '**/*.d.ts']},
  ...tseslint.configs.recommended.map(config => ({...config, files: ['**/*.ts']})),
  {
    files: ['**/*.ts'],
    rules: {
      // CommonJS single-value packages must preserve require() export shape.
      '@typescript-eslint/no-require-imports': ['error', {allowAsImport: true}],
      '@typescript-eslint/no-unused-vars': ['error', {args: 'none', caughtErrors: 'none', ignoreRestSiblings: true}]
    }
  }
];
