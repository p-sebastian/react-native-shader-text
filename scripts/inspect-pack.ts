#!/usr/bin/env bun
// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {lstatSync, mkdtempSync, readdirSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {basename, join, relative} from 'node:path'

type TNpmPackFile = {path: string; size: number}
type TNpmPackResult = {filename: string; files: TNpmPackFile[]}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const parsePackResult = (contents: string): TNpmPackResult => {
  const value: unknown = JSON.parse(contents)
  const result = Array.isArray(value) ? value[0] : undefined
  if (
    !isRecord(result) ||
    typeof result.filename !== 'string' ||
    basename(result.filename) !== result.filename ||
    !Array.isArray(result.files)
  ) {
    throw new Error('npm pack returned an invalid result.')
  }
  const files = result.files.map((file: unknown): TNpmPackFile => {
    if (!isRecord(file) || typeof file.path !== 'string' || typeof file.size !== 'number') {
      throw new Error('npm pack returned an invalid file entry.')
    }
    return {path: file.path, size: file.size}
  })
  return {filename: result.filename, files}
}

const packageRoot = join(import.meta.dir, '..')
const temporaryRoot = mkdtempSync(join(tmpdir(), 'react-native-shader-text-pack-'))
const packDirectory = join(temporaryRoot, 'pack')
const extractDirectory = join(temporaryRoot, 'extract')

const run = (command: string[]): string => {
  const result = Bun.spawnSync({cmd: command, cwd: packageRoot, stderr: 'pipe', stdout: 'pipe'})
  if (result.exitCode !== 0) throw new Error(result.stderr.toString() || `${command[0]} failed.`)
  return result.stdout.toString()
}

const isAllowedPath = (path: string): boolean =>
  path === 'LICENSE' ||
  path === 'README.md' ||
  path === 'ReactNativeShaderText.podspec' ||
  path === 'nitro.json' ||
  path === 'package.json' ||
  path.startsWith('build/') ||
  path.startsWith('ios/') ||
  path.startsWith('nitrogen/generated/')

const walk = (directory: string): string[] =>
  readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })

try {
  run(['mkdir', '-p', packDirectory, extractDirectory])
  const packOutput = run([
    'npm',
    'pack',
    '--json',
    '--ignore-scripts',
    '--cache',
    join(temporaryRoot, 'npm-cache'),
    '--pack-destination',
    packDirectory,
  ])
  const packResult = parsePackResult(packOutput)
  const packedPaths = new Set(packResult.files.map(file => file.path))
  const unexpectedFiles = [...packedPaths].filter(path => !isAllowedPath(path))
  if (unexpectedFiles.length > 0) throw new Error(`Unexpected tarball files:\n${unexpectedFiles.join('\n')}`)

  const requiredFiles = [
    'LICENSE',
    'README.md',
    'ReactNativeShaderText.podspec',
    'build/index.d.ts',
    'build/index.js',
    'ios/GradientGlow.metal',
    'nitrogen/generated/ios/ReactNativeShaderText+autolinking.rb',
  ]
  const missingFiles = requiredFiles.filter(path => !packedPaths.has(path))
  if (missingFiles.length > 0) throw new Error(`Missing required tarball files:\n${missingFiles.join('\n')}`)

  const tarball = join(packDirectory, packResult.filename)
  const entries = run(['tar', '-tzf', tarball]).trim().split('\n')
  if (entries.some(entry => !entry.startsWith('package/') || entry.includes('../') || entry.startsWith('/'))) {
    throw new Error('Tarball contains an unsafe path.')
  }

  run(['tar', '-xzf', tarball, '-C', extractDirectory])
  const extractedPackage = join(extractDirectory, 'package')
  const extractedFiles = walk(extractedPackage)
  const symlink = extractedFiles.find(path => lstatSync(path).isSymbolicLink())
  if (symlink) throw new Error(`Tarball contains a symbolic link: ${relative(extractedPackage, symlink)}`)

  const disclosurePatterns = [
    /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/u,
    /gh[opsu]_[A-Za-z0-9_]{20,}/u,
    /npm_[A-Za-z0-9]{20,}/u,
    /@regalia|RegaliaShaderText|\bVellum\b/u,
  ]
  for (const file of extractedFiles) {
    const contents = await Bun.file(file).text()
    if (disclosurePatterns.some(pattern => pattern.test(contents))) {
      throw new Error(`Private identifier found in ${relative(extractedPackage, file)}.`)
    }
  }

  const gitleaksAvailable = Bun.spawnSync({
    cmd: ['sh', '-c', 'command -v gitleaks'],
    stderr: 'ignore',
    stdout: 'ignore',
  })
  if (gitleaksAvailable.exitCode === 0) {
    run(['gitleaks', 'detect', '--no-git', '--redact', '--source', extractedPackage])
  }
  console.log(`Verified ${packResult.files.length} files in ${packResult.filename}.`)
} finally {
  rmSync(temporaryRoot, {force: true, recursive: true})
}
