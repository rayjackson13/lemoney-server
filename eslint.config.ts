import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import ts from 'typescript-eslint'

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    files: ['**/*.ts', '**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
      parser: ts.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
)
