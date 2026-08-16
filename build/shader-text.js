import { jsx as _jsx } from "react/jsx-runtime";
// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { callback } from 'react-native-nitro-modules';
import { NativeShaderText } from './native-shader-text';
import { DEFAULT_BLUR_OUT_DURATION, DEFAULT_DELAY, DEFAULT_DURATION, DEFAULT_FONT_SIZE, DEFAULT_REVEAL_BLUR_RADIUS, DEFAULT_REVEAL_DURATION, flattenShaderTextChildren, resolveTextColor, validateShaderTextProps, } from './shader-text.util';
export const ShaderText = (props) => {
    const { accessibilityLabel, allowFontScaling = true, animation, blurOutDuration = DEFAULT_BLUR_OUT_DURATION, children, color, delay = DEFAULT_DELAY, duration = DEFAULT_DURATION, ellipsizeMode = 'tail', fontSize = DEFAULT_FONT_SIZE, italic = false, lineHeight, maxFontSizeMultiplier, numberOfLines, onAnimationEnd, onAnimationStart, revealBlurRadius = DEFAULT_REVEAL_BLUR_RADIUS, revealDuration = DEFAULT_REVEAL_DURATION, style, textAlign = 'left', theme = 'light', variant = 'primary', weight = 'regular', ...viewProps } = props;
    if (Platform.OS !== 'ios')
        throw new Error('ShaderText is iOS-only.');
    validateShaderTextProps({
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
    });
    const segments = flattenShaderTextChildren(children);
    const combinedAccessibilityLabel = accessibilityLabel ?? segments.map(segment => segment.text).join('');
    const textColor = resolveTextColor(color, theme, variant);
    const flattenedStyle = StyleSheet.flatten(style);
    const hasExplicitHeight = flattenedStyle?.height !== undefined;
    const [contentHeight, setContentHeight] = useState(lineHeight ?? fontSize * 1.2);
    const onContentHeightChange = callback((height) => {
        setContentHeight(currentHeight => (Math.abs(currentHeight - height) > 0.5 ? height : currentHeight));
    });
    const onNativeAnimationStart = callback(() => onAnimationStart?.());
    const onNativeAnimationEnd = callback((result) => onAnimationEnd?.(result));
    return (_jsx(NativeShaderText, { ...viewProps, ...(animation === undefined ? {} : { animation }), ...(lineHeight === undefined ? {} : { lineHeight }), ...(maxFontSizeMultiplier === undefined ? {} : { maxFontSizeMultiplier }), ...(numberOfLines === undefined ? {} : { numberOfLines }), accessibilityLabel: combinedAccessibilityLabel, accessible: true, allowFontScaling: allowFontScaling, blurOutDuration: blurOutDuration, combinedAccessibilityLabel: combinedAccessibilityLabel, delay: delay, duration: duration, ellipsizeMode: ellipsizeMode, fontSize: fontSize, fontWeight: weight, italic: italic, onAnimationEnd: onNativeAnimationEnd, onAnimationStart: onNativeAnimationStart, onContentHeightChange: onContentHeightChange, pointerEvents: "none", revealBlurRadius: revealBlurRadius, revealDuration: revealDuration, segments: segments, style: [styles.block, hasExplicitHeight ? undefined : { height: contentHeight }, style], textAlign: textAlign, textColor: textColor }));
};
export const ShaderRun = (_props) => {
    throw new Error('ShaderRun must be rendered as a direct or fragmented child of ShaderText.');
};
const styles = StyleSheet.create({ block: { alignSelf: 'stretch' } });
//# sourceMappingURL=shader-text.js.map