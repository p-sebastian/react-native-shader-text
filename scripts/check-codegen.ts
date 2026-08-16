#!/usr/bin/env bun
// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {join} from 'node:path'

const packageRoot = join(import.meta.dir, '..')

const run = (command: string[]): string => {
  const result = Bun.spawnSync({cmd: command, cwd: packageRoot, stderr: 'pipe', stdout: 'pipe'})
  if (result.exitCode !== 0) throw new Error(result.stderr.toString() || `${command[0]} failed.`)
  return result.stdout.toString().trim()
}

run(['bun', 'run', 'codegen'])
const drift = run(['git', 'status', '--porcelain', '--', 'nitrogen/generated'])
if (drift) throw new Error(`Nitrogen generated output is stale:\n${drift}`)

console.log('Nitrogen generated output matches the authored schema and configuration.')
