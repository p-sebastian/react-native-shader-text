// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import Testing
@testable import ReactNativeShaderTextPolicy

@Suite("Shader Text native policy")
struct ShaderTextPolicyTests {
  @Test("normalizes public millisecond inputs")
  func normalizesMilliseconds() {
    #expect(ShaderTextPolicy.positiveMilliseconds(2_000) == 2)
    #expect(ShaderTextPolicy.positiveMilliseconds(0) == 0.001)
    #expect(ShaderTextPolicy.nonnegativeMilliseconds(-20) == 0)
  }

  @Test("freezes shader phase under Reduce Motion")
  func freezesReducedMotionPhase() {
    #expect(ShaderTextPolicy.animationPhase(elapsed: 3, duration: 2, reduceMotion: true) == 0)
    #expect(ShaderTextPolicy.animationPhase(elapsed: 3, duration: 2, reduceMotion: false) == 0.5)
  }

  @Test("clamps reveal and cancellation progress")
  func clampsProgress() {
    #expect(ShaderTextPolicy.progress(elapsed: -1, duration: 0.6) == 0)
    #expect(ShaderTextPolicy.progress(elapsed: 0.3, duration: 0.6) == 0.5)
    #expect(ShaderTextPolicy.progress(elapsed: 1, duration: 0.6) == 1)
  }

  @Test("rounds measurements to the display scale and suppresses jitter")
  func roundsMeasuredHeight() {
    #expect(ShaderTextPolicy.measuredHeight(20.1, scale: 2, previousHeight: 0) == 20.5)
    #expect(ShaderTextPolicy.measuredHeight(20.2, scale: 2, previousHeight: 20.5) == nil)
    #expect(ShaderTextPolicy.measuredHeight(.nan, scale: 2, previousHeight: 0) == nil)
  }
}
