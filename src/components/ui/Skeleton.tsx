/**
 * Skeleton Component - Animated loading placeholder
 *
 * Base skeleton component with shimmer animation for loading states.
 * Matches the app's nature-inspired theme.
 */

import { useEffect, useRef } from 'react';
import { View, ViewProps, StyleSheet, Animated } from 'react-native';

export interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  variant?: 'rect' | 'circle';
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#8B7355', // Muted bark brown
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
});

/**
 * Skeleton loading placeholder with shimmer animation
 *
 * @param width - Width of skeleton (number in pixels or string percentage)
 * @param height - Height of skeleton (number in pixels or string percentage)
 * @param borderRadius - Border radius (defaults to 8)
 * @param variant - Shape variant: 'rect' or 'circle'
 *
 * @example
 * ```tsx
 * <Skeleton width={200} height={20} />
 * <Skeleton width="100%" height={60} borderRadius={12} />
 * <Skeleton width={40} height={40} variant="circle" />
 * ```
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  variant = 'rect',
  style,
  ...props
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const calculatedBorderRadius = variant === 'circle'
    ? typeof width === 'number' ? width / 2 : 999
    : borderRadius;

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: calculatedBorderRadius,
        },
        style,
      ]}
      {...props}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: '#D4C5A9', // Lighter parchment shimmer
            opacity: shimmerOpacity,
          },
        ]}
      />
    </View>
  );
}
