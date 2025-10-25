/**
 * LivingForestBg Component - Forest background wrapper
 *
 * Wraps content with the forest background image and dark overlay.
 * Creates atmosphere and consistency across screens.
 */

import React from 'react';
import { StyleSheet, ImageBackground, View } from 'react-native';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 15, 0.75)',
  },
});

export interface LivingForestBgProps {
  children: React.ReactNode;
}

export function LivingForestBg({ children }: LivingForestBgProps) {
  return (
    <ImageBackground
      source={require('../../../assets/forest-background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <View style={styles.darkOverlay}>
        {children}
      </View>
    </ImageBackground>
  );
}
