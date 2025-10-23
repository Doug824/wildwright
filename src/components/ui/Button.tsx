/**
 * Button Component - Interactive buttons for the WildWright UI
 *
 * Supports multiple variants (primary, secondary, outline, ghost) and sizes.
 * Includes loading state with spinner.
 */

import { Pressable, Text, ActivityIndicator, View, PressableProps, StyleSheet } from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },

  // Variant styles
  primary: {
    backgroundColor: '#C68647', // Richer bronze
    borderColor: '#E8B882', // Light bronze for glow effect
  },
  secondary: {
    backgroundColor: '#2A4A3A', // Forest-600
    borderColor: '#1A3A2E',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#B97A3D', // Bronze
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: '#DC2626', // Red-600
    borderColor: '#B91C1C',
  },

  // Pressed states
  primaryPressed: {
    backgroundColor: '#A66B2E',
  },
  secondaryPressed: {
    backgroundColor: '#1A3A2E',
  },
  outlinePressed: {
    backgroundColor: 'rgba(185, 122, 61, 0.1)',
  },
  ghostPressed: {
    backgroundColor: 'rgba(42, 74, 58, 0.2)',
  },
  dangerPressed: {
    backgroundColor: '#B91C1C',
  },

  // Size styles
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // Text styles
  text: {
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 17,
  },
  textPrimary: {
    color: '#F9F5EB', // Parchment-50
  },
  textSecondary: {
    color: '#F0E8D5', // Parchment-100
  },
  textOutline: {
    color: '#B97A3D', // Bronze
  },
  textGhost: {
    color: '#E8DCC8', // Parchment-200
  },
  textDanger: {
    color: '#FFFFFF',
  },

  // Other styles
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  loadingIcon: {
    marginRight: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Variant style mapping
  const variantStyle = {
    primary: styles.primary,
    secondary: styles.secondary,
    outline: styles.outline,
    ghost: styles.ghost,
    danger: styles.danger,
  }[variant];

  const pressedVariantStyle = {
    primary: styles.primaryPressed,
    secondary: styles.secondaryPressed,
    outline: styles.outlinePressed,
    ghost: styles.ghostPressed,
    danger: styles.dangerPressed,
  }[variant];

  // Size style mapping
  const sizeStyle = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  }[size];

  const textSizeStyle = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  }[size];

  // Text color mapping
  const textColorStyle = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    outline: styles.textOutline,
    ghost: styles.textGhost,
    danger: styles.textDanger,
  }[variant];

  // Loading indicator color
  const loadingColor = variant === 'outline' ? '#B97A3D' : '#F0E8D5';

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && pressedVariantStyle,
        {
          // Enhanced shadow and glow for primary button
          shadowColor: variant === 'primary' ? '#B97A3D' : (variant === 'danger' ? '#DC2626' : '#000'),
          shadowOffset: { width: 0, height: pressed ? 2 : 4 },
          shadowOpacity: pressed ? 0.3 : 0.6,
          shadowRadius: pressed ? 6 : 12,
          elevation: pressed ? 4 : 8,
        },
      ]}
      {...props}
    >
      <View style={styles.innerContainer}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={loadingColor}
            style={styles.loadingIcon}
          />
        )}
        <Text style={[styles.text, textSizeStyle, textColorStyle]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}
