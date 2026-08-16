// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import NitroModules
import SwiftUI
import UIKit

class HybridShaderText: HybridShaderTextSpec, RecyclableView {
  let view = ShaderTextView()

  var segments: [ShaderTextSegment] = [] {
    didSet {
      let segments = segments.map(ShaderTextContentSegment.init)
      updateView { view in
        view.setSegments(segments)
      }
    }
  }

  var animation: String? = nil {
    didSet {
      let animation = animation
      updateView { view in
        view.setAnimation(animation)
      }
    }
  }

  var duration: Double = 2_000 {
    didSet {
      let duration = ShaderTextPolicy.positiveMilliseconds(duration)
      updateView { view in
        view.model.duration = duration
      }
    }
  }

  var blurOutDuration: Double = 500 {
    didSet {
      let blurOutDuration = ShaderTextPolicy.positiveMilliseconds(blurOutDuration)
      updateView { view in
        view.model.blurOutDuration = blurOutDuration
      }
    }
  }

  var delay: Double = 0 {
    didSet {
      let delay = ShaderTextPolicy.nonnegativeMilliseconds(delay)
      updateView { view in
        view.model.delay = delay
      }
    }
  }

  var fontSize: Double = 14 {
    didSet {
      let fontSize = max(1, CGFloat(fontSize))
      updateView { view in
        view.model.fontSize = fontSize
        view.updateFontScale()
        view.contentDidChange()
      }
    }
  }

  var fontWeight: String = "regular" {
    didSet {
      let fontWeight = fontWeight
      updateView { view in
        view.model.fontWeight = fontWeight
        view.contentDidChange()
      }
    }
  }

  var italic: Bool = false {
    didSet {
      let italic = italic
      updateView { view in
        view.model.italic = italic
        view.contentDidChange()
      }
    }
  }

  var textAlign: String = "left" {
    didSet {
      let textAlign = textAlign
      updateView { view in
        view.model.textAlign = textAlign
        view.contentDidChange()
      }
    }
  }

  var textColor: String = "#FFFFFFFF" {
    didSet {
      let color = UIColor(argbHex: textColor) ?? .label
      updateView { view in
        view.model.textColor = Color(uiColor: color)
      }
    }
  }

  var lineHeight: Double? = nil {
    didSet {
      let lineHeight = lineHeight.map { max(1, CGFloat($0)) }
      updateView { view in
        view.model.lineHeight = lineHeight
        view.contentDidChange()
      }
    }
  }

  var numberOfLines: Double? = nil {
    didSet {
      let numberOfLines = numberOfLines.flatMap { $0 > 0 ? Int($0) : nil }
      updateView { view in
        view.model.numberOfLines = numberOfLines
        view.contentDidChange()
      }
    }
  }

  var ellipsizeMode: String = "tail" {
    didSet {
      let ellipsizeMode = ellipsizeMode
      updateView { view in
        view.model.ellipsizeMode = ellipsizeMode
        view.contentDidChange()
      }
    }
  }

  var allowFontScaling: Bool = true {
    didSet {
      let allowFontScaling = allowFontScaling
      updateView { view in
        view.model.allowFontScaling = allowFontScaling
        view.updateFontScale()
        view.contentDidChange()
      }
    }
  }

  var maxFontSizeMultiplier: Double? = nil {
    didSet {
      let maxFontSizeMultiplier = maxFontSizeMultiplier
      updateView { view in
        view.model.maxFontSizeMultiplier = maxFontSizeMultiplier
        view.updateFontScale()
        view.contentDidChange()
      }
    }
  }

  var combinedAccessibilityLabel: String = "" {
    didSet {
      let combinedAccessibilityLabel = combinedAccessibilityLabel
      updateView { view in
        view.accessibilityLabel = combinedAccessibilityLabel
      }
    }
  }

  var revealBlurRadius: Double = 8 {
    didSet {
      let revealBlurRadius = max(0, CGFloat(revealBlurRadius))
      updateView { view in
        view.model.revealBlurRadius = revealBlurRadius
      }
    }
  }

  var revealDuration: Double = 600 {
    didSet {
      let revealDuration = ShaderTextPolicy.positiveMilliseconds(revealDuration)
      updateView { view in
        view.model.revealDuration = revealDuration
      }
    }
  }

  var onAnimationStart: (() -> Void)? = nil {
    didSet {
      let onAnimationStart = onAnimationStart
      updateView { view in
        view.onAnimationStart = onAnimationStart
      }
    }
  }

  var onAnimationEnd: ((_ result: ShaderTextAnimationEndResult) -> Void)? = nil {
    didSet {
      let onAnimationEnd = onAnimationEnd
      updateView { view in
        view.onAnimationEnd = onAnimationEnd
      }
    }
  }

  var onContentHeightChange: ((_ height: Double) -> Void)? = nil {
    didSet {
      let onContentHeightChange = onContentHeightChange
      updateView { view in
        view.onContentHeightChange = onContentHeightChange
        view.contentDidChange()
      }
    }
  }

  func prepareForRecycle() {
    updateView { view in
      view.reset()
    }
  }

  func onDropView() {}

  private func updateView(_ update: @escaping (ShaderTextView) -> Void) {
    if Thread.isMainThread {
      update(view)
    } else {
      DispatchQueue.main.async { [weak view] in
        guard let view else {
          return
        }

        update(view)
      }
    }
  }
}


