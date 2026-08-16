// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import SwiftUI
import UIKit

struct ShaderTextContent: View {
  @ObservedObject var model: ShaderTextModel
  @Environment(\.accessibilityReduceMotion) private var reduceMotion

  var body: some View {
    TimelineView(.animation(minimumInterval: 1.0 / 30.0, paused: reduceMotion)) { context in
      renderedText
        .textRenderer(
          ShaderTextRenderer(
            phase: phase(at: context.date),
            reduceMotion: reduceMotion,
            revealBlurRadius: model.revealBlurRadius,
            revealProgress: revealProgress(at: context.date),
            blurOutProgress: blurOutProgress(at: context.date)
          )
        )
    }
    .allowsHitTesting(false)
    .accessibilityHidden(true)
  }

  private var renderedText: some View {
    combinedText
      .font(swiftUIFont(size: model.scaledFontSize, weight: model.fontWeight, italic: model.italic))
      .foregroundStyle(model.textColor)
      .multilineTextAlignment(textAlignment(model.textAlign))
      .lineSpacing(model.scaledLineSpacing)
      .lineLimit(model.numberOfLines)
      .truncationMode(resolvedTruncationMode(model.ellipsizeMode))
      .fixedSize(horizontal: false, vertical: true)
      .frame(maxWidth: .infinity, alignment: frameAlignment(model.textAlign))
  }

  private var combinedText: Text {
    model.segments.reduce(Text("")) { result, segment in
      result + renderedSegment(segment)
    }
  }

  private func renderedSegment(_ segment: ShaderTextContentSegment) -> Text {
    contiguousTextGroups(in: segment.text).reduce(Text("")) { result, group in
      var fragment = Text(verbatim: group.text)

      if group.isVisible {
        fragment = fragment.customAttribute(RevealGlyphAttribute())
      }

      if
        segment.shader == "color-fade",
        let colorHex = segment.colors.first,
        let color = UIColor(argbHex: colorHex)
      {
        fragment = fragment.foregroundColor(Color(uiColor: color))
      }

      if let shader = segment.shader {
        fragment = fragment.customAttribute(
          ShaderRunAttribute(shader: shader, colors: segment.colors, blurRadius: segment.blurRadius)
        )
      }

      return result + fragment
    }
  }

  private func contiguousTextGroups(in text: String) -> [(text: String, isVisible: Bool)] {
    var groups: [(text: String, isVisible: Bool)] = []

    for character in text {
      let isVisible = !character.unicodeScalars.allSatisfy { $0.properties.isWhitespace }

      if groups.last?.isVisible == isVisible {
        groups[groups.count - 1].text.append(character)
      } else {
        groups.append((String(character), isVisible))
      }
    }

    return groups
  }

  private func phase(at date: Date) -> Double? {
    guard let startedAt = model.runShadersStartedAt else {
      return nil
    }

    return ShaderTextPolicy.animationPhase(
      elapsed: date.timeIntervalSince(startedAt),
      duration: model.duration,
      reduceMotion: reduceMotion
    )
  }

  private func revealProgress(at date: Date) -> Double? {
    guard model.animation == "blur-reveal" else {
      return nil
    }

    if model.revealPending {
      return 0
    }

    guard let startedAt = model.revealStartedAt else {
      return nil
    }

    return ShaderTextPolicy.progress(
      elapsed: date.timeIntervalSince(startedAt),
      duration: model.activeRevealDuration
    )
  }

  private func blurOutProgress(at date: Date) -> Double? {
    guard let startedAt = model.blurOutStartedAt else {
      return nil
    }

    return ShaderTextPolicy.progress(
      elapsed: date.timeIntervalSince(startedAt),
      duration: model.activeBlurOutDuration
    )
  }
}

let shaderTextLibrary = ShaderLibrary.bundle(shaderTextBundle())

private func shaderTextBundle() -> Bundle {
  guard
    let bundleUrl = Bundle.main.url(forResource: "ReactNativeShaderText", withExtension: "bundle"),
    let bundle = Bundle(url: bundleUrl)
  else {
    fatalError("ReactNativeShaderText.bundle is missing from the application bundle.")
  }

  return bundle
}

private func swiftUIFont(size: CGFloat, weight: String, italic: Bool) -> Font {
  let font = Font.system(size: size, weight: swiftUIFontWeight(weight))
  return italic ? font.italic() : font
}

private func swiftUIFontWeight(_ weight: String) -> Font.Weight {
  switch weight {
  case "ultralight": .ultraLight
  case "thin": .thin
  case "light": .light
  case "medium": .medium
  case "semibold": .semibold
  case "bold": .bold
  case "heavy": .heavy
  case "black": .black
  default: .regular
  }
}

func uiFontWeight(_ weight: String) -> UIFont.Weight {
  switch weight {
  case "ultralight": .ultraLight
  case "thin": .thin
  case "light": .light
  case "medium": .medium
  case "semibold": .semibold
  case "bold": .bold
  case "heavy": .heavy
  case "black": .black
  default: .regular
  }
}

private func textAlignment(_ textAlign: String) -> TextAlignment {
  switch textAlign {
  case "center": .center
  case "right": .trailing
  default: .leading
  }
}

private func frameAlignment(_ textAlign: String) -> Alignment {
  switch textAlign {
  case "center": .center
  case "right": .trailing
  default: .leading
  }
}

private func resolvedTruncationMode(_ ellipsizeMode: String) -> Text.TruncationMode {
  switch ellipsizeMode {
  case "head": .head
  case "middle": .middle
  default: .tail
  }
}

extension UIColor {
  convenience init?(argbHex: String) {
    let trimmed = argbHex.trimmingCharacters(in: .whitespacesAndNewlines)
    let hex = trimmed.hasPrefix("#") ? String(trimmed.dropFirst()) : trimmed

    guard hex.count == 8, let value = UInt64(hex, radix: 16) else {
      return nil
    }

    self.init(
      red: CGFloat((value >> 16) & 0xFF) / 255,
      green: CGFloat((value >> 8) & 0xFF) / 255,
      blue: CGFloat(value & 0xFF) / 255,
      alpha: CGFloat((value >> 24) & 0xFF) / 255
    )
  }
}

