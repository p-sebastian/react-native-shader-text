import type { ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native';
export type TShaderTextWeight = 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
export type TShaderTextTheme = 'light' | 'dark';
export type TShaderTextVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'placeholder' | 'link' | 'accent' | 'danger';
export type TShaderTextProps = Omit<ViewProps, 'accessibilityLabel' | 'children' | 'style'> & {
    children: ReactNode;
    accessibilityLabel?: string;
    allowFontScaling?: boolean;
    animation?: 'blur-reveal';
    blurOutDuration?: number;
    color?: ColorValue;
    delay?: number;
    duration?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail';
    fontSize?: number;
    italic?: boolean;
    lineHeight?: number;
    maxFontSizeMultiplier?: number;
    numberOfLines?: number;
    onAnimationEnd?: (result: TShaderTextAnimationEndResult) => void;
    onAnimationStart?: () => void;
    revealBlurRadius?: number;
    revealDuration?: number;
    style?: StyleProp<ViewStyle>;
    textAlign?: 'left' | 'center' | 'right';
    theme?: TShaderTextTheme;
    variant?: TShaderTextVariant;
    weight?: TShaderTextWeight;
};
export type TShaderTextAnimationEndResult = {
    finished: boolean;
};
export type TGradientGlowShaderRunProps = {
    blurRadius?: number;
    children: ReactNode;
    colors: readonly [ColorValue, ColorValue];
    shader: 'gradient-glow';
};
export type TColorFadeShaderRunProps = {
    children: ReactNode;
    color?: ColorValue;
    shader: 'color-fade';
};
export type TShaderRunProps = TColorFadeShaderRunProps | TGradientGlowShaderRunProps;
//# sourceMappingURL=shader-text.type.d.ts.map