// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT

export type TReleaseIncrement = 'major' | 'minor' | 'patch'

export const getNextStableVersion = (current: string, increment: TReleaseIncrement): string => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u.exec(current)
  if (!match) throw new Error('Committed version must be stable SemVer.')

  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3])
  if (increment === 'major') return `${major + 1}.0.0`
  if (increment === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}
