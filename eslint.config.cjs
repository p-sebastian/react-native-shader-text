// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
const {defineConfig} = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  {
    ignores: ['apps/example/ios/**', 'build/**', 'nitrogen/generated/**', 'node_modules/**'],
  },
  expoConfig,
  {
    settings: {
      'import/core-modules': ['bun:test'],
    },
  },
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      'react/no-children-prop': 'off',
    },
  },
])
