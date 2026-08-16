// standards-exception: filename-role — Nitrogen discovers authored schemas only through the required .nitro.ts suffix.
// standards-exception: declaration-prefix — Nitrogen requires these native schema identifiers to match generated iOS bridge contracts.
import type {HybridView, HybridViewMethods, HybridViewProps} from 'react-native-nitro-modules'

// standards-exception: declaration-prefix — Nitrogen generates the existing iOS bridge from this schema identifier; renaming it requires coordinated codegen and native migration.
export interface ShaderTextSegment {
  text: string
  shader?: string
  colors?: string[]
  blurRadius?: number
}

// standards-exception: declaration-prefix — Nitrogen generates the existing iOS bridge from this schema identifier; renaming it requires coordinated codegen and native migration.
export interface ShaderTextAnimationEndResult {
  finished: boolean
}

// standards-exception: declaration-prefix — Nitrogen generates the existing iOS bridge from this schema identifier; renaming it requires coordinated codegen and native migration.
export interface ShaderTextProps extends HybridViewProps {
  segments: ShaderTextSegment[]
  animation?: string
  blurOutDuration: number
  delay: number
  duration: number
  fontSize: number
  fontWeight: string
  italic: boolean
  textAlign: string
  textColor: string
  lineHeight?: number
  numberOfLines?: number
  ellipsizeMode: string
  allowFontScaling: boolean
  maxFontSizeMultiplier?: number
  combinedAccessibilityLabel: string
  revealBlurRadius: number
  revealDuration: number
  onAnimationStart?: () => void
  onAnimationEnd?: (result: ShaderTextAnimationEndResult) => void
  onContentHeightChange?: (height: number) => void
}

// standards-exception: declaration-prefix — Nitrogen generates the existing iOS bridge from this schema identifier; renaming it requires coordinated codegen and native migration.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Nitrogen requires a named methods interface.
export interface ShaderTextMethods extends HybridViewMethods {}

// standards-exception: declaration-prefix — Nitrogen generates the existing iOS bridge from this schema identifier; renaming it requires coordinated codegen and native migration.
export type ShaderText = HybridView<
  ShaderTextProps,
  ShaderTextMethods,
  {
    ios: 'swift'
  }
>
