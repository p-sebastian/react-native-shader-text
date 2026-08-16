// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {getHostComponent} from 'react-native-nitro-modules'

import type {
  ShaderText as TShaderText,
  ShaderTextAnimationEndResult as IShaderTextAnimationEndResult,
  ShaderTextMethods as IShaderTextMethods,
  ShaderTextProps as IShaderTextProps,
  ShaderTextSegment as IShaderTextSegment,
} from './specs/shader-text.nitro'

export type {IShaderTextAnimationEndResult, IShaderTextMethods, IShaderTextProps, IShaderTextSegment, TShaderText}

export const NativeShaderText = getHostComponent<IShaderTextProps, IShaderTextMethods>('ShaderText', () => ({
  uiViewClassName: 'ShaderText',
  supportsRawText: false,
  bubblingEventTypes: {},
  directEventTypes: {},
  validAttributes: {
    allowFontScaling: true,
    animation: true,
    blurOutDuration: true,
    combinedAccessibilityLabel: true,
    delay: true,
    duration: true,
    ellipsizeMode: true,
    fontSize: true,
    fontWeight: true,
    hybridRef: true,
    italic: true,
    lineHeight: true,
    maxFontSizeMultiplier: true,
    numberOfLines: true,
    onAnimationEnd: true,
    onAnimationStart: true,
    onContentHeightChange: true,
    revealBlurRadius: true,
    revealDuration: true,
    segments: true,
    textAlign: true,
    textColor: true,
  },
}))
