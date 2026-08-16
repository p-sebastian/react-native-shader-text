// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {describe, expect, mock, test} from 'bun:test'
import {createElement, Fragment, type ReactElement} from 'react'
import {act, create, type ReactTestRenderer} from 'react-test-renderer'

const nativeViewType = 'ReactNativeShaderTextNativeView'

mock.module('react-native-nitro-modules', () => ({
  callback: <TCallback extends (...args: never[]) => unknown>(value: TCallback) => value,
  getHostComponent: () => nativeViewType,
}))

mock.module('react-native', () => ({
  Platform: {OS: 'ios'},
  StyleSheet: {
    create: <TStyles,>(styles: TStyles) => styles,
    flatten: (style: unknown) => (Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style),
  },
  processColor: (color: unknown) => {
    if (color === 'transparent') return 0
    if (typeof color !== 'string' || !/^#[\dA-Fa-f]{6}$/u.test(color)) return null
    return (Number.parseInt(color.slice(1), 16) | 0xff000000) >> 0
  },
}))

Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true})

const {ShaderRun, ShaderText} = await import('./index')

type TNativeProps = {
  accessibilityLabel: string
  blurOutDuration: number
  combinedAccessibilityLabel: string
  delay: number
  duration: number
  fontSize: number
  fontWeight: string
  onAnimationEnd: (result: {finished: boolean}) => void
  onAnimationStart: () => void
  onContentHeightChange: (height: number) => void
  revealBlurRadius: number
  revealDuration: number
  segments: {blurRadius?: number; colors?: string[]; shader?: string; text: string}[]
  style: unknown[]
  textColor: string
}

const renderNativeProps = (element: ReactElement): {props: TNativeProps; renderer: ReactTestRenderer} => {
  let renderer: ReactTestRenderer | undefined
  act(() => {
    renderer = create(element)
  })
  if (!renderer) throw new Error('ShaderText renderer was not created.')
  return {props: renderer.root.find(node => (node.type as unknown) === nativeViewType).props as TNativeProps, renderer}
}

describe('ShaderText public interface', () => {
  test('flattens text-like children into one accessible passage with separate shader runs', () => {
    const {props} = renderNativeProps(
      <ShaderText fontSize={42} textAlign="center">
        {[
          'Your ',
          ['library', 2],
          createElement(Fragment, {key: 'fragment'}, false, ' made '),
          <ShaderRun key="glow" shader="gradient-glow" colors={['#52D3D8', 'transparent']}>
            beautiful
          </ShaderRun>,
          <ShaderRun key="fade" shader="color-fade" color="#FF3B30">
            !
          </ShaderRun>,
        ]}
      </ShaderText>,
    )

    expect(props.segments).toEqual([
      {text: 'Your library2 made '},
      {
        text: 'beautiful',
        shader: 'gradient-glow',
        colors: ['#FF52D3D8', '#00000000'],
        blurRadius: 10,
      },
      {text: '!', shader: 'color-fade', colors: ['#FFFF3B30']},
    ])
    expect(props.accessibilityLabel).toBe('Your library2 made beautiful!')
    expect(props.combinedAccessibilityLabel).toBe('Your library2 made beautiful!')
  })

  test('supplies stable animation, typography, semantic color, and automatic-height defaults', () => {
    const {props} = renderNativeProps(<ShaderText>Readable</ShaderText>)

    expect(props).toMatchObject({
      blurOutDuration: 500,
      delay: 0,
      duration: 2000,
      fontSize: 14,
      fontWeight: 'regular',
      revealBlurRadius: 8,
      revealDuration: 600,
      textColor: '#FF000000',
    })
    expect(props.style).toEqual([{alignSelf: 'stretch'}, {height: 16.8}, undefined])
  })

  test('remeasures automatic height and preserves an explicit height', () => {
    const automatic = renderNativeProps(<ShaderText>Wrapped</ShaderText>)
    act(() => automatic.props.onContentHeightChange(72))
    expect(automatic.renderer.root.find(node => (node.type as unknown) === nativeViewType).props.style).toEqual([
      {alignSelf: 'stretch'},
      {height: 72},
      undefined,
    ])

    const explicit = renderNativeProps(<ShaderText style={{height: 40}}>Fixed</ShaderText>)
    expect(explicit.props.style).toEqual([{alignSelf: 'stretch'}, undefined, {height: 40}])
  })

  test('forwards animation lifecycle callbacks through the Nitro callback seam', () => {
    const events: unknown[] = []
    const onAnimationStart = (): void => {
      events.push('start')
    }
    const onAnimationEnd = (result: {finished: boolean}): void => {
      events.push(result)
    }
    const {props} = renderNativeProps(
      <ShaderText onAnimationStart={onAnimationStart} onAnimationEnd={onAnimationEnd}>
        Animated
      </ShaderText>,
    )

    props.onAnimationStart()
    props.onAnimationEnd({finished: false})
    expect(events).toEqual(['start', {finished: false}])
  })

  test('rejects nested runs, unsupported elements, malformed colors, and invalid timing', () => {
    const nested = (
      <ShaderText>
        <ShaderRun shader="color-fade">
          <ShaderRun shader="color-fade">nested</ShaderRun>
        </ShaderRun>
      </ShaderText>
    )
    const unsupported = <ShaderText>{createElement('span', null, 'unsupported')}</ShaderText>
    const malformedColor = (
      <ShaderText>
        <ShaderRun shader="gradient-glow" colors={['dynamic', '#FFFFFF']}>
          bad
        </ShaderRun>
      </ShaderText>
    )
    const invalidTiming = <ShaderText duration={0}>bad</ShaderText>

    expect(() => renderNativeProps(nested)).toThrow('cannot contain another ShaderRun')
    expect(() => renderNativeProps(unsupported)).toThrow('only accepts strings')
    expect(() => renderNativeProps(malformedColor)).toThrow('only supports static colors')
    expect(() => renderNativeProps(invalidTiming)).toThrow('duration must be a finite number greater than zero')
  })
})
