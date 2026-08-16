// swift-tools-version: 6.0
// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import PackageDescription

let package = Package(
  name: "ReactNativeShaderTextPolicy",
  platforms: [.macOS(.v14)],
  products: [.library(name: "ReactNativeShaderTextPolicy", targets: ["ReactNativeShaderTextPolicy"])],
  targets: [
    .target(
      name: "ReactNativeShaderTextPolicy",
      path: "ios",
      exclude: [
        "CocoaPodsBundledResourcePlaceholder",
        "GradientGlow.metal",
        "HybridShaderText.swift",
        "ShaderTextContent.swift",
        "ShaderTextRenderer.swift",
        "ShaderTextView.swift",
      ],
      sources: ["ShaderTextPolicy.swift"]
    ),
    .testTarget(
      name: "ReactNativeShaderTextPolicyTests",
      dependencies: ["ReactNativeShaderTextPolicy"],
      path: "Tests"
    ),
  ]
)
