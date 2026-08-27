const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');

module.exports = tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '.eslintcache'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    extends: [
      ...tseslint.configs.recommended,
    ],
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          // This will load the tsconfig.json from the current directory
          // and use the paths defined therein.
          // You can also specify the project if you have multiple tsconfigs
          // project: ['./tsconfig.json']
        }
      }
    },
    rules: {
      // Formatting rules from portfolio (adapted for this project)
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'key-spacing': ['error'],
      'arrow-spacing': ['error'],
      'space-in-parens': ['error'],
      'keyword-spacing': ['error'],
      'block-spacing': ['error', 'always'],
      'space-before-blocks': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'eol-last': ['error', 'always'],
      
      // TypeScript specific rules
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      
      // Import rules
      'no-duplicate-imports': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'type', ['internal', 'parent'], 'sibling'],
          alphabetize: { order: 'asc' },
          'newlines-between': 'always'
        }
      ],
      'import/no-unresolved': 'error',
      'no-restricted-imports': ['error', { patterns: ['../'] }],
    }
  }
);