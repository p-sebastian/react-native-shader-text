import type { HybridView, HybridViewMethods, HybridViewProps } from 'react-native-nitro-modules';
export interface ShaderTextSegment {
    text: string;
    shader?: string;
    colors?: string[];
    blurRadius?: number;
}
export interface ShaderTextAnimationEndResult {
    finished: boolean;
}
export interface ShaderTextProps extends HybridViewProps {
    segments: ShaderTextSegment[];
    animation?: string;
    blurOutDuration: number;
    delay: number;
    duration: number;
    fontSize: number;
    fontWeight: string;
    italic: boolean;
    textAlign: string;
    textColor: string;
    lineHeight?: number;
    numberOfLines?: number;
    ellipsizeMode: string;
    allowFontScaling: boolean;
    maxFontSizeMultiplier?: number;
    combinedAccessibilityLabel: string;
    revealBlurRadius: number;
    revealDuration: number;
    onAnimationStart?: () => void;
    onAnimationEnd?: (result: ShaderTextAnimationEndResult) => void;
    onContentHeightChange?: (height: number) => void;
}
export interface ShaderTextMethods extends HybridViewMethods {
}
export type ShaderText = HybridView<ShaderTextProps, ShaderTextMethods, {
    ios: 'swift';
}>;
//# sourceMappingURL=shader-text.nitro.d.ts.map