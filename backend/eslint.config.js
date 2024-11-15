import js from '@eslint/js'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  // JavaScript 的基本設定
  js.configs.recommended,

  {
    ignores: ['dist', 'node_modules', 'public', 'tests'],
  },

  // TypeScript 插件和解析器設定
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      semi: ['error', 'never'], // 禁用分號
      'prettier/prettier': [
        'error',
        {
          semi: false,
        },
      ],
      'no-console': 'warn',
    },
  },
]
