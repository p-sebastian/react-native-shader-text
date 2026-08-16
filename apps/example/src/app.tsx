// Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
// SPDX-License-Identifier: MIT
import {ShaderRun, ShaderText} from '@p-sebastian/react-native-shader-text'
import {StatusBar} from 'expo-status-bar'
import {useEffect, useState, type ReactElement} from 'react'
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native'

export const App = (): ReactElement => {
  const [changingCopy, setChangingCopy] = useState('First reveal')
  const [animationEvents, setAnimationEvents] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setChangingCopy('Replacement reveal'), 300)
    return () => clearTimeout(timer)
  }, [])

  const onAnimationEnd = ({finished}: {finished: boolean}) => {
    setAnimationEvents(events => [...events, finished ? 'finished' : 'cancelled'])
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>React Native Shader Text</Text>
        <View style={styles.card}>
          <ShaderText accessibilityLabel="Gradient glow shader" fontSize={32} testID="gradient-glow-contract">
            Native{' '}
            <ShaderRun shader="gradient-glow" colors={['#00A6FF', 'transparent']}>
              gradient glow
            </ShaderRun>
          </ShaderText>
        </View>
        <View style={styles.card}>
          <ShaderText accessibilityLabel="Color fade shader" fontSize={28} testID="color-fade-contract">
            A{' '}
            <ShaderRun shader="color-fade" color="#FF3B30">
              moving color fade
            </ShaderRun>
          </ShaderText>
        </View>
        <View style={styles.card}>
          <ShaderText
            accessibilityLabel="Blur reveal animation"
            animation="blur-reveal"
            fontSize={24}
            revealBlurRadius={4}
            revealDuration={800}
            testID="blur-reveal-contract">
            One accessible multiline passage that measures itself.
          </ShaderText>
        </View>
        <View style={styles.card}>
          <ShaderText animation="blur-reveal" revealDuration={800} onAnimationEnd={onAnimationEnd}>
            {changingCopy}
          </ShaderText>
          <Text accessibilityLabel={animationEvents.join(',')} testID="animation-lifecycle-contract">
            {animationEvents.join(',')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {backgroundColor: '#F2F2F7', flex: 1},
  content: {gap: 20, padding: 24},
  heading: {color: '#111111', fontSize: 22, fontWeight: '700'},
  card: {backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20},
})
