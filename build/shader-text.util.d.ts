import { type ReactNode } from 'react';
import { type ColorValue } from 'react-native';
import type { IShaderTextSegment } from './native-shader-text';
import type { TShaderTextProps, TShaderTextTheme, TShaderTextVariant } from './shader-text.type';
export declare const DEFAULT_DURATION = 2000;
export declare const DEFAULT_FONT_SIZE = 14;
export declare const DEFAULT_BLUR_RADIUS = 10;
export declare const DEFAULT_BLUR_OUT_DURATION = 500;
export declare const DEFAULT_DELAY = 0;
export declare const DEFAULT_REVEAL_BLUR_RADIUS = 8;
export declare const DEFAULT_REVEAL_DURATION = 600;
export declare const normalizeColor: (color: ColorValue) => string;
export declare const resolveTextColor: (color: ColorValue | undefined, theme: TShaderTextTheme, variant: TShaderTextVariant) => string;
export declare const flattenShaderTextChildren: (children: ReactNode) => IShaderTextSegment[];
export declare const validateShaderTextProps: ({ animation, blurOutDuration, delay, duration, fontSize, lineHeight, maxFontSizeMultiplier, numberOfLines, revealBlurRadius, revealDuration, }: TShaderTextValidationProps) => void;
type TShaderTextValidationProps = {
    animation: TShaderTextProps['animation'] | undefined;
    blurOutDuration: number;
    delay: number;
    duration: number;
    fontSize: number;
    lineHeight: number | undefined;
    maxFontSizeMultiplier: number | undefined;
    numberOfLines: number | undefined;
    revealBlurRadius: number;
    revealDuration: number;
};
export {};
//# sourceMappingURL=shader-text.util.d.ts.map