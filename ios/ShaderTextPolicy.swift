// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import Foundation

enum ShaderTextPolicy {
  static func positiveMilliseconds(_ value: Double) -> TimeInterval {
    max(1, value) / 1_000
  }

  static func nonnegativeMilliseconds(_ value: Double) -> TimeInterval {
    max(0, value) / 1_000
  }

  static func animationPhase(elapsed: TimeInterval, duration: TimeInterval, reduceMotion: Bool) -> Double {
    if reduceMotion {
      return 0
    }
    let safeDuration = max(0.001, duration)
    return max(0, elapsed).truncatingRemainder(dividingBy: safeDuration) / safeDuration
  }

  static func progress(elapsed: TimeInterval, duration: TimeInterval) -> Double {
    min(1, max(0, elapsed / max(0.001, duration)))
  }

  static func measuredHeight(_ measuredHeight: Double, scale: Double, previousHeight: Double) -> Double? {
    guard measuredHeight.isFinite, measuredHeight > 0, scale.isFinite, scale > 0 else {
      return nil
    }
    let roundedHeight = ceil(measuredHeight * scale) / scale
    return abs(roundedHeight - previousHeight) > 0.5 ? roundedHeight : nil
  }
}
