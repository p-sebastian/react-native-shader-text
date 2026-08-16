// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {Children, Fragment, isValidElement, type ReactNode} from 'react'
import {processColor, type ColorValue} from 'react-native'

import type {IShaderTextSegment} from './native-shader-text'
import {ShaderRun} from './shader-text'
import type {
  TGradientGlowShaderRunProps,
  TShaderRunProps,
  TShaderTextProps,
  TShaderTextTheme,
  TShaderTextVariant,
} from './shader-text.type'

export const DEFAULT_DURATION = 2_000
export const DEFAULT_FONT_SIZE = 14
export const DEFAULT_BLUR_RADIUS = 10
export const DEFAULT_BLUR_OUT_DURATION = 500
export const DEFAULT_DELAY = 0
export const DEFAULT_REVEAL_BLUR_RADIUS = 8
export const DEFAULT_REVEAL_DURATION = 600

const semanticColors: Record<TShaderTextTheme, Record<TShaderTextVariant, ColorValue>> = {
  light: {
    primary: '#000000',
    secondary: 'rgba(60, 60, 67, 0.6)',
    tertiary: 'rgba(60, 60, 67, 0.3)',
    quaternary: 'rgba(60, 60, 67, 0.18)',
    placeholder: 'rgba(60, 60, 67, 0.3)',
    link: '#007AFF',
    accent: '#007AFF',
    danger: '#FF3B30',
  },
  dark: {
    primary: '#FFFFFF',
    secondary: 'rgba(235, 235, 245, 0.6)',
    tertiary: 'rgba(235, 235, 245, 0.3)',
    quaternary: 'rgba(235, 235, 245, 0.18)',
    placeholder: 'rgba(235, 235, 245, 0.3)',
    link: '#0A84FF',
    accent: '#0A84FF',
    danger: '#FF453A',
  },
}

export const normalizeColor = (color: ColorValue): string => {
  const processedColor = processColor(color)
  if (typeof processedColor !== 'number') throw new Error('ShaderText only supports static colors.')
  return `#${(processedColor >>> 0).toString(16).padStart(8, '0').toUpperCase()}`
}

export const resolveTextColor = (
  color: ColorValue | undefined,
  theme: TShaderTextTheme,
  variant: TShaderTextVariant,
): string => normalizeColor(color ?? semanticColors[theme][variant])

export const flattenShaderTextChildren = (children: ReactNode): IShaderTextSegment[] => {
  const segments: IShaderTextSegment[] = []
  appendChildren(children, segments, false)
  return segments
}

const appendChildren = (children: ReactNode, segments: IShaderTextSegment[], insideShaderRun: boolean): void => {
  Children.forEach(children, child => {
    if (child === null || child === undefined || typeof child === 'boolean') return
    if (typeof child === 'string' || typeof child === 'number') {
      appendSegment(segments, {text: String(child)}, insideShaderRun)
      return
    }
    if (!isValidElement(child)) throw new Error(acceptedChildrenMessage)
    if (child.type === Fragment) {
      appendChildren((child.props as {children?: ReactNode}).children, segments, insideShaderRun)
      return
    }
    if (child.type !== ShaderRun) throw new Error(acceptedChildrenMessage)
    if (insideShaderRun) throw new Error('ShaderRun elements cannot contain another ShaderRun.')
    appendShaderRun(child.props as TShaderRunProps, segments)
  })
}

const acceptedChildrenMessage = 'ShaderText only accepts strings, numbers, fragments, arrays, and ShaderRun elements.'

const appendShaderRun = (props: TShaderRunProps, segments: IShaderTextSegment[]): void => {
  const runSegments: IShaderTextSegment[] = []
  appendChildren(props.children, runSegments, true)
  const text = runSegments.map(segment => segment.text).join('')
  switch (props.shader) {
    case 'gradient-glow':
      validateGradientGlowProps(props)
      segments.push({
        text,
        shader: props.shader,
        colors: props.colors.map(normalizeColor),
        blurRadius: props.blurRadius ?? DEFAULT_BLUR_RADIUS,
      })
      return
    case 'color-fade':
      segments.push({
        text,
        shader: props.shader,
        ...(props.color === undefined ? {} : {colors: [normalizeColor(props.color)]}),
      })
      return
    default:
      throw new Error(`Unsupported ShaderRun shader: ${String((props as {shader?: unknown}).shader)}.`)
  }
}

const appendSegment = (segments: IShaderTextSegment[], segment: IShaderTextSegment, insideShaderRun: boolean): void => {
  const previous = segments.at(-1)
  if (!insideShaderRun && previous !== undefined && previous.shader === undefined) {
    previous.text += segment.text
  } else {
    segments.push(segment)
  }
}

const validateGradientGlowProps = (props: TGradientGlowShaderRunProps): void => {
  if (props.colors.length !== 2) {
    throw new Error('ShaderRun with shader="gradient-glow" requires exactly two colors.')
  }
  if (props.blurRadius !== undefined && (!Number.isFinite(props.blurRadius) || props.blurRadius < 0)) {
    throw new Error('ShaderRun blurRadius must be a finite number greater than or equal to zero.')
  }
}

export const validateShaderTextProps = ({
  animation,
  blurOutDuration,
  delay,
  duration,
  fontSize,
  lineHeight,
  maxFontSizeMultiplier,
  numberOfLines,
  revealBlurRadius,
  revealDuration,
}: TShaderTextValidationProps): void => {
  if (animation !== undefined && animation !== 'blur-reveal') {
    throw new Error('ShaderText animation must be "blur-reveal" when provided.')
  }
  assertPositiveFinite(blurOutDuration, 'blurOutDuration')
  assertNonnegativeFinite(delay, 'delay')
  assertPositiveFinite(duration, 'duration')
  assertPositiveFinite(fontSize, 'fontSize')
  if (lineHeight !== undefined) assertPositiveFinite(lineHeight, 'lineHeight')
  if (maxFontSizeMultiplier !== undefined) assertNonnegativeFinite(maxFontSizeMultiplier, 'maxFontSizeMultiplier')
  if (numberOfLines !== undefined && (!Number.isInteger(numberOfLines) || numberOfLines < 0)) {
    throw new Error('ShaderText numberOfLines must be a nonnegative integer.')
  }
  assertNonnegativeFinite(revealBlurRadius, 'revealBlurRadius')
  assertPositiveFinite(revealDuration, 'revealDuration')
}

const assertPositiveFinite = (value: number, name: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`ShaderText ${name} must be a finite number greater than zero.`)
  }
}

const assertNonnegativeFinite = (value: number, name: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`ShaderText ${name} must be a finite number greater than or equal to zero.`)
  }
}

type TShaderTextValidationProps = {
  animation: TShaderTextProps['animation'] | undefined
  blurOutDuration: number
  delay: number
  duration: number
  fontSize: number
  lineHeight: number | undefined
  maxFontSizeMultiplier: number | undefined
  numberOfLines: number | undefined
  revealBlurRadius: number
  revealDuration: number
}
