// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {expect, test} from 'bun:test'

import {getNextStableVersion} from './release-version.util'

test('advances stable versions without introducing prerelease state', () => {
  expect(getNextStableVersion('1.2.3', 'patch')).toBe('1.2.4')
  expect(getNextStableVersion('1.2.3', 'minor')).toBe('1.3.0')
  expect(getNextStableVersion('1.2.3', 'major')).toBe('2.0.0')
})

test('rejects versions outside the stable release contract', () => {
  expect(() => getNextStableVersion('1.2.3-beta.1', 'patch')).toThrow('Committed version must be stable SemVer.')
})
