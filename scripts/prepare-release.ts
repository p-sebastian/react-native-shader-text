#!/usr/bin/env bun
// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import {getNextStableVersion, type TReleaseIncrement} from './release-version.util'

const packageRoot = join(import.meta.dir, '..')

const parsePackageIdentity = (contents: string): Record<string, unknown> & {name: string; version: string} => {
  const value: unknown = JSON.parse(contents)
  if (
    typeof value !== 'object' ||
    value === null ||
    !('name' in value) ||
    typeof value.name !== 'string' ||
    !('version' in value) ||
    typeof value.version !== 'string'
  ) {
    throw new Error('package.json must contain string name and version fields.')
  }
  return {...value, name: value.name, version: value.version}
}

const run = (command: string[]): string => {
  const result = Bun.spawnSync({cmd: command, cwd: packageRoot, stderr: 'pipe', stdout: 'pipe'})
  if (result.exitCode !== 0) throw new Error(result.stderr.toString() || `${command[0]} failed.`)
  return result.stdout.toString().trim()
}

const increment = process.argv[2] as TReleaseIncrement | undefined
if (increment !== 'patch' && increment !== 'minor' && increment !== 'major') {
  throw new Error('Usage: bun release:prepare <patch|minor|major>')
}

if (run(['git', 'status', '--porcelain'])) throw new Error('Release preparation requires a clean worktree.')
if (run(['git', 'branch', '--show-current']) !== 'main') throw new Error('Release preparation must start on main.')
if (run(['gh', 'api', 'user', '--jq', '.login']) !== 'p-sebastian') {
  throw new Error('GitHub CLI must be authenticated as p-sebastian.')
}

const packagePath = join(packageRoot, 'package.json')
const packageJson = parsePackageIdentity(readFileSync(packagePath, 'utf8'))
const publishedVersion = run(['npm', 'view', packageJson.name, 'version'])
if (publishedVersion !== packageJson.version) {
  throw new Error(`Committed version ${packageJson.version} does not match npm ${publishedVersion}.`)
}

const nextVersion = getNextStableVersion(packageJson.version, increment)
run(['git', 'switch', '-c', `release/v${nextVersion}`])
writeFileSync(packagePath, `${JSON.stringify({...packageJson, version: nextVersion}, null, 2)}\n`)
run(['bun', 'install', '--lockfile-only'])

console.log(`Prepared release/v${nextVersion}. Review the package and open a squash-merge pull request.`)
