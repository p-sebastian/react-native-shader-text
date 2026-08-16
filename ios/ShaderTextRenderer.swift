// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import SwiftUI
import UIKit

final class ShaderTextModel: ObservableObject {
  @Published var segments: [ShaderTextContentSegment] = []
  @Published var animation: String?
  @Published var duration: TimeInterval = 2
  @Published var delay: TimeInterval = 0
  @Published var blurOutDuration: TimeInterval = 0.5
  @Published var activeBlurOutDuration: TimeInterval = 0.5
  @Published var blurOutStartedAt: Date?
  @Published var fontSize: CGFloat = 14
  @Published var fontScale: CGFloat = 1
  @Published var fontWeight = "regular"
  @Published var italic = false
  @Published var textAlign = "left"
  @Published var textColor = Color(uiColor: .label)
  @Published var lineHeight: CGFloat?
  @Published var numberOfLines: Int?
  @Published var ellipsizeMode = "tail"
  @Published var revealBlurRadius: CGFloat = 8
  @Published var revealDuration: TimeInterval = 0.6
  @Published var activeRevealDuration: TimeInterval = 0.6
  @Published var revealPending = false
  @Published var revealStartedAt: Date?
  @Published var runShadersStartedAt: Date?

  var allowFontScaling = true
  var maxFontSizeMultiplier: Double?

  var scaledFontSize: CGFloat {
    fontSize * fontScale
  }

  var combinedText: String {
    segments.map(\.text).joined()
  }

  var hasVisibleContent: Bool {
    combinedText.contains { character in
      !character.unicodeScalars.allSatisfy { $0.properties.isWhitespace }
    }
  }

  var scaledLineSpacing: CGFloat {
    guard let lineHeight else {
      return 0
    }

    let naturalLineHeight = UIFont.systemFont(ofSize: scaledFontSize, weight: uiFontWeight(fontWeight)).lineHeight
    return lineHeight * fontScale - naturalLineHeight
  }

  func reset() {
    segments = []
    animation = nil
    duration = 2
    delay = 0
    blurOutDuration = 0.5
    activeBlurOutDuration = 0.5
    blurOutStartedAt = nil
    fontSize = 14
    fontScale = 1
    fontWeight = "regular"
    italic = false
    textAlign = "left"
    textColor = Color(uiColor: .label)
    lineHeight = nil
    numberOfLines = nil
    ellipsizeMode = "tail"
    revealBlurRadius = 8
    revealDuration = 0.6
    activeRevealDuration = 0.6
    revealPending = false
    revealStartedAt = nil
    runShadersStartedAt = nil
    allowFontScaling = true
    maxFontSizeMultiplier = nil
  }
}

struct ShaderRunAttribute: TextAttribute {
  let shader: String
  let colors: [String]
  let blurRadius: CGFloat
}

struct RevealGlyphAttribute: TextAttribute {}

struct ShaderTextRenderer: TextRenderer {
  let phase: Double?
  let reduceMotion: Bool
  let revealBlurRadius: CGFloat
  let revealProgress: Double?
  let blurOutProgress: Double?

  func draw(layout: Text.Layout, in context: inout GraphicsContext) {
    guard revealProgress != nil || blurOutProgress != nil else {
      drawCompleteLayout(layout, context: &context)
      return
    }

    let glyphCount = visibleGlyphCount(in: layout)
    var glyphIndex = 0

    for line in layout {
      for run in line {
        guard run[RevealGlyphAttribute.self] != nil else {
          context.draw(run)
          continue
        }

        let runBounds = run.typographicBounds.rect

        for glyph in run {
          let easedProgress: Double
          let blurProgress: Double

          if let blurOutProgress {
            easedProgress = 1 - easeInCubic(blurOutProgress)
            blurProgress = 1 - easedProgress
          } else {
            let progress = glyphProgress(
              at: glyphIndex,
              glyphCount: glyphCount,
              revealProgress: revealProgress ?? 1
            )
            easedProgress = easeOutCubic(progress)
            blurProgress = 1 - easedProgress
          }
          var glyphContext = context

          glyphContext.opacity = easedProgress
          glyphContext.addFilter(.blur(radius: revealBlurRadius * blurProgress))

          if blurOutProgress != nil, let phase, let attribute = run[ShaderRunAttribute.self] {
            let xOffset = -runBounds.minX

            switch attribute.shader {
            case "gradient-glow":
              drawGradientGlow(
                runSize: runBounds.size,
                xOffset: xOffset,
                phase: phase,
                attribute: attribute,
                context: &glyphContext,
                draw: { context in context.draw(glyph) }
              )
            case "color-fade":
              drawColorFade(
                runSize: runBounds.size,
                xOffset: xOffset,
                phase: reduceMotion ? 0.5 : phase,
                context: &glyphContext,
                draw: { context in context.draw(glyph) }
              )
            default:
              glyphContext.draw(glyph)
            }
          } else {
            glyphContext.draw(glyph)
          }

          glyphIndex += 1
        }
      }
    }
  }

  private func drawCompleteLayout(_ layout: Text.Layout, context: inout GraphicsContext) {
    for line in layout {
      for run in line {
        guard let phase, let attribute = run[ShaderRunAttribute.self] else {
          context.draw(run)
          continue
        }

        let runBounds = run.typographicBounds.rect

        switch attribute.shader {
        case "gradient-glow":
          drawGradientGlow(
            runSize: runBounds.size,
            xOffset: -runBounds.minX,
            phase: phase,
            attribute: attribute,
            context: &context,
            draw: { context in context.draw(run) }
          )
        case "color-fade":
          drawColorFade(
            runSize: runBounds.size,
            xOffset: -runBounds.minX,
            phase: reduceMotion ? 0.5 : phase,
            context: &context,
            draw: { context in context.draw(run) }
          )
        default:
          context.draw(run)
        }
      }
    }
  }

  private func drawColorFade(
    runSize: CGSize,
    xOffset: CGFloat,
    phase: Double,
    context: inout GraphicsContext,
    draw: (inout GraphicsContext) -> Void
  ) {
    var shaderContext = context

    shaderContext.addFilter(
      .colorShader(
        Shader(
          function: shaderTextLibrary.colorFade,
          arguments: [
            .float2(runSize),
            .float(Float(xOffset)),
            .float(Float(phase)),
          ]
        )
      )
    )
    draw(&shaderContext)
  }

  private func drawGradientGlow(
    runSize: CGSize,
    xOffset: CGFloat,
    phase: Double,
    attribute: ShaderRunAttribute,
    context: inout GraphicsContext,
    draw: (inout GraphicsContext) -> Void
  ) {
    guard attribute.colors.count == 2 else {
      draw(&context)
      return
    }

    let startColor = Color(uiColor: UIColor(argbHex: attribute.colors[0]) ?? .clear)
    let endColor = Color(uiColor: UIColor(argbHex: attribute.colors[1]) ?? .clear)
    var glowContext = context

    glowContext.addFilter(
      .colorShader(
        Shader(
          function: shaderTextLibrary.gradientGlow,
          arguments: [
            .float2(runSize),
            .float(Float(xOffset)),
            .float(Float(phase)),
            .color(startColor),
            .color(endColor),
          ]
        )
      )
    )
    glowContext.addFilter(.blur(radius: attribute.blurRadius))
    draw(&glowContext)
    draw(&glowContext)
    draw(&context)
  }

  private func visibleGlyphCount(in layout: Text.Layout) -> Int {
    layout.reduce(into: 0) { lineCount, line in
      lineCount += line.reduce(into: 0) { runCount, run in
        if run[RevealGlyphAttribute.self] != nil {
          runCount += run.count
        }
      }
    }
  }

  private func glyphProgress(at index: Int, glyphCount: Int, revealProgress: Double) -> Double {
    guard glyphCount > 1 else {
      return revealProgress
    }

    let localDuration = 0.4
    let start = Double(index) / Double(glyphCount - 1) * (1 - localDuration)
    return min(1, max(0, (revealProgress - start) / localDuration))
  }

  private func easeOutCubic(_ progress: Double) -> Double {
    1 - pow(1 - progress, 3)
  }

  private func easeInCubic(_ progress: Double) -> Double {
    pow(progress, 3)
  }
}

