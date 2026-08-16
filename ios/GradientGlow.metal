// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
#include <metal_stdlib>
using namespace metal;

[[ stitchable ]]
half4 gradientGlow(
  float2 position,
  half4 color,
  float2 size,
  float xOffset,
  float phase,
  half4 startColor,
  half4 endColor
) {
  float width = max(size.x, 1.0);
  float normalizedX = (position.x + xOffset) / width;
  float angle = (normalizedX - phase) * 6.28318530718;
  float blend = sin(angle) * 0.5 + 0.5;
  half4 gradientColor = mix(startColor, endColor, half(blend));

  return gradientColor * color.a;
}

[[ stitchable ]]
half4 colorFade(
  float2 position,
  half4 color,
  float2 size,
  float xOffset,
  float progress
) {
  float width = max(size.x, 1.0);
  float normalizedX = (position.x + xOffset) / width;
  constexpr float bandWidth = 0.35;
  constexpr float halfBandWidth = bandWidth * 0.5;
  constexpr half fadeFloor = 0.35h;
  float center = mix(-halfBandWidth, 1.0 + halfBandWidth, progress);
  float normalizedDistance = abs(normalizedX - center) / halfBandWidth;
  float influence = 1.0 - smoothstep(0.0, 1.0, normalizedDistance);
  half opacity = mix(1.0h, fadeFloor, half(influence));

  return color * opacity;
}
