/**
 * LivingForestBg Component - Animated forest background
 *
 * Slowly animating gradient background that feels alive.
 * Creates atmosphere without being distracting.
 */

import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
  },
  animatedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export interface LivingForestBgProps {
  children: React.ReactNode;
  intensity?: number; // 0-1, how much the overlay pulses
}

export function LivingForestBg({ children, intensity = 0.15 }: LivingForestBgProps) {
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const baseOpacity = 0.75;
    const opacity = baseOpacity + (Math.sin(pulseValue.value * Math.PI) * intensity);
    return {
      opacity,
    };
  });

  return (
    <ImageBackground
      source={require('../../../assets/forest-background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <Animated.View style={[styles.animatedOverlay, animatedStyle]}>
        <LinearGradient
          colors={['rgba(10, 20, 15, 0.75)', 'rgba(15, 25, 20, 0.75)']}
          style={styles.darkOverlay}
        />
      </Animated.View>
      {children}
    </ImageBackground>
  );
}
