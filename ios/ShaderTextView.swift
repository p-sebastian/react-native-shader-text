// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import NitroModules
import SwiftUI
import UIKit

struct ShaderTextContentSegment: Equatable {
  let text: String
  let shader: String?
  let colors: [String]
  let blurRadius: CGFloat

  init(_ segment: ShaderTextSegment) {
    text = segment.text
    shader = segment.shader
    colors = segment.colors ?? []
    blurRadius = max(0, CGFloat(segment.blurRadius ?? 10))
  }
}

final class ShaderTextView: UIView {
  let model = ShaderTextModel()
  var onContentHeightChange: ((_ height: Double) -> Void)?
  var onAnimationStart: (() -> Void)?
  var onAnimationEnd: ((_ result: ShaderTextAnimationEndResult) -> Void)?

  private lazy var host = UIHostingController(rootView: ShaderTextContent(model: model))
  private var hasReceivedSegments = false
  private var lastMeasuredHeight: CGFloat = 0
  private var revealCompletion: DispatchWorkItem?
  private var revealDelayCompletion: DispatchWorkItem?
  private var blurOutCompletion: DispatchWorkItem?
  private var pendingSegments: [ShaderTextContentSegment]?

  override init(frame: CGRect) {
    super.init(frame: frame)
    clipsToBounds = false
    backgroundColor = .clear
    isOpaque = false
    isAccessibilityElement = true
    accessibilityTraits = .staticText

    host.view.backgroundColor = .clear
    host.view.isOpaque = false
    host.view.isUserInteractionEnabled = false
    host.view.accessibilityElementsHidden = true
    addSubview(host.view)
    registerForTraitChanges([UITraitPreferredContentSizeCategory.self]) {
      (self: Self, _previousTraitCollection: UITraitCollection) in
      self.updateFontScale()
      self.contentDidChange()
    }
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(reduceMotionStatusDidChange),
      name: UIAccessibility.reduceMotionStatusDidChangeNotification,
      object: nil
    )
    updateFontScale()
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    host.view.frame = bounds
    measureContent()
    startPendingRevealIfPossible()
  }

  override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
    false
  }

  func contentDidChange() {
    setNeedsLayout()
    DispatchQueue.main.async { [weak self] in
      self?.measureContent()
    }
  }

  func setSegments(_ segments: [ShaderTextContentSegment]) {
    let isInitialValue = !hasReceivedSegments

    hasReceivedSegments = true

    if isInitialValue {
      model.segments = segments
      DispatchQueue.main.async { [weak self] in
        self?.revealOrActivateShaders()
      }
    } else if pendingSegments != nil {
      if segments == model.segments {
        cancelBlurOut()
      } else {
        pendingSegments = segments
      }
    } else if segments != model.segments {
      queueSegmentChange(segments)
    }

    contentDidChange()
  }

  func setAnimation(_ animation: String?) {
    guard model.animation != animation else {
      return
    }

    cancelReveal(notify: true)
    model.animation = animation

    if animation == "blur-reveal", hasReceivedSegments {
      queueRevealIfNeeded()
    } else if hasReceivedSegments {
      activateRunShaders()
    }
  }

  func updateFontScale() {
    guard model.allowFontScaling else {
      model.fontScale = 1
      return
    }

    let scaledFontSize = UIFontMetrics.default.scaledValue(for: model.fontSize, compatibleWith: traitCollection)
    var multiplier = scaledFontSize / model.fontSize

    if let maximum = model.maxFontSizeMultiplier, maximum > 0 {
      multiplier = min(multiplier, CGFloat(maximum))
    }

    model.fontScale = max(1, multiplier)
  }

  func reset() {
    cancelBlurOut()
    cancelReveal(notify: false)
    onAnimationStart = nil
    onAnimationEnd = nil
    model.reset()
    accessibilityLabel = nil
    onContentHeightChange = nil
    lastMeasuredHeight = 0
    hasReceivedSegments = false
    updateFontScale()
    contentDidChange()
  }

  private func queueSegmentChange(_ segments: [ShaderTextContentSegment]) {
    if model.revealPending || revealDelayCompletion != nil {
      cancelReveal(notify: false)
      model.segments = segments
      queueRevealIfNeeded()
      return
    }

    pendingSegments = segments

    if blurOutCompletion != nil {
      return
    }

    cancelReveal(notify: true)

    if UIAccessibility.isReduceMotionEnabled || !model.hasVisibleContent {
      completeBlurOut()
      return
    }

    model.blurOutStartedAt = Date()
    model.activeBlurOutDuration = model.blurOutDuration
    let completion = DispatchWorkItem { [weak self] in
      self?.completeBlurOut()
    }
    blurOutCompletion = completion
    DispatchQueue.main.asyncAfter(deadline: .now() + model.activeBlurOutDuration, execute: completion)
  }

  private func completeBlurOut() {
    blurOutCompletion = nil
    model.blurOutStartedAt = nil

    guard let segments = pendingSegments else {
      return
    }

    pendingSegments = nil
    model.runShadersStartedAt = nil
    model.segments = segments
    revealOrActivateShaders()
    contentDidChange()
  }

  private func cancelBlurOut() {
    blurOutCompletion?.cancel()
    blurOutCompletion = nil
    pendingSegments = nil
    model.blurOutStartedAt = nil
  }

  private func queueRevealIfNeeded() {
    guard model.animation == "blur-reveal" else {
      return
    }

    cancelReveal(notify: true)
    model.runShadersStartedAt = nil
    model.revealPending = true
    setNeedsLayout()

    DispatchQueue.main.async { [weak self] in
      self?.startPendingRevealIfPossible()
    }
  }

  private func startPendingRevealIfPossible() {
    guard model.revealPending, revealDelayCompletion == nil, bounds.width > 0, window != nil else {
      return
    }

    let delay = model.delay

    guard delay > 0 else {
      beginReveal()
      return
    }

    let completion = DispatchWorkItem { [weak self] in
      self?.beginReveal()
    }
    revealDelayCompletion = completion
    DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: completion)
  }

  private func beginReveal() {
    revealDelayCompletion = nil
    model.revealPending = false
    onAnimationStart?()

    if UIAccessibility.isReduceMotionEnabled || !model.hasVisibleContent {
      activateRunShaders()
      onAnimationEnd?(ShaderTextAnimationEndResult(finished: true))
      return
    }

    model.revealStartedAt = Date()
    model.activeRevealDuration = model.revealDuration
    let completion = DispatchWorkItem { [weak self] in
      self?.completeReveal()
    }
    revealCompletion = completion
    DispatchQueue.main.asyncAfter(deadline: .now() + model.activeRevealDuration, execute: completion)
  }

  private func completeReveal() {
    guard revealCompletion != nil else {
      return
    }

    revealCompletion = nil
    model.revealStartedAt = nil
    activateRunShaders()
    onAnimationEnd?(ShaderTextAnimationEndResult(finished: true))
  }

  private func revealOrActivateShaders() {
    if model.animation == "blur-reveal" {
      queueRevealIfNeeded()
    } else {
      activateRunShaders()
    }
  }

  private func activateRunShaders() {
    model.runShadersStartedAt = model.segments.contains { $0.shader != nil } ? Date() : nil
  }

  private func cancelReveal(notify: Bool) {
    let wasRunning = revealCompletion != nil
    revealDelayCompletion?.cancel()
    revealDelayCompletion = nil
    revealCompletion?.cancel()
    revealCompletion = nil
    model.revealPending = false
    model.revealStartedAt = nil

    if notify, wasRunning {
      onAnimationEnd?(ShaderTextAnimationEndResult(finished: false))
    }
  }

  @objc private func reduceMotionStatusDidChange() {
    if UIAccessibility.isReduceMotionEnabled {
      completeReveal()
    }
  }

  private func measureContent() {
    guard bounds.width > 0 else {
      return
    }

    let fittingSize = CGSize(width: bounds.width, height: CGFloat.greatestFiniteMagnitude)
    let measuredHeight = host.sizeThatFits(in: fittingSize).height
    let scale = window?.screen.scale ?? UIScreen.main.scale
    guard
      let roundedHeight = ShaderTextPolicy.measuredHeight(
        Double(measuredHeight),
        scale: Double(scale),
        previousHeight: Double(lastMeasuredHeight)
      )
    else {
      return
    }

    lastMeasuredHeight = CGFloat(roundedHeight)
    onContentHeightChange?(roundedHeight)
  }
}

