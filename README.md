# React Native Shader Text

An iOS 18+ SwiftUI text view with selectable Metal shader runs for Expo and React Native. It keeps the passage in one native text layout while applying effects to explicit spans.

## Install

```sh
npm install @p-sebastian/react-native-shader-text react-native-nitro-modules
```

This package is iOS-only and supports Expo SDK 57, React 19.2, React Native 0.86, and Nitro Modules 0.35.

## Usage

```tsx
import {ShaderRun, ShaderText} from '@p-sebastian/react-native-shader-text'

export const Title = () => (
  <ShaderText animation="blur-reveal" fontSize={42} textAlign="center">
    Your library made{' '}
    <ShaderRun shader="gradient-glow" colors={['#52D3D8', 'transparent']} blurRadius={10}>
      beautiful
    </ShaderRun>
  </ShaderText>
)
```

`ShaderRun` is a marker consumed by `ShaderText`; it is not an independently mounted native view. Children may contain strings, numbers, arrays, fragments, conditional values, and non-nested runs.

### Shader runs

- `gradient-glow` requires exactly two static colors and accepts a nonnegative `blurRadius`.
- `color-fade` inherits the effective text color or accepts a static `color` override.

All runs share a linear animation phase. Reduce Motion freezes the gradient at phase zero and centers the color-fade band.

### Text and layout

`ShaderText` supports SF Pro weights, italic text, light/dark semantic color variants, a concrete `color` override, alignment, Dynamic Type, line height, line limits, truncation, automatic multiline height, and an explicit height override.

VoiceOver receives the concatenated passage as one static-text element. `accessibilityLabel` overrides the generated label. The view is display-only and does not intercept touches.

### Reveal lifecycle

Set `animation="blur-reveal"` to blur and reveal incoming content. `delay`, `revealDuration`, `revealBlurRadius`, and `blurOutDuration` are expressed in milliseconds. `onAnimationEnd` reports `{finished: false}` when an active reveal is cancelled.

## Example App

The managed Expo fixture lives in `apps/example` and uses the package through `file:../..`. Run `bun consumer:build` to copy it into an isolated directory, install from scratch, regenerate iOS, and build Debug and Release simulator applications.

## Development

```sh
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run codegen:check
bun run build
bun run pack:inspect
```

## License

MIT
