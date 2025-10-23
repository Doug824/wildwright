/**
 * Button Component - Epic Druidic Buttons
 *
 * Natural wood and earth-inspired interactive buttons with magical energy.
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
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },

  // Magical energy overlay for primary buttons
  magicOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(127, 209, 168, 0.15)', // Ethereal green
    borderRadius: 12,
  },

  // Variant styles
  primary: {
    backgroundColor: '#5C7A5E', // Deep forest green
    borderColor: '#7FD1A8', // Magical green glow border
  },
  secondary: {
    backgroundColor: '#8B7355', // Rich earth brown
    borderColor: '#B8977E',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#6B9F7F', // Natural green
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: '#8B4545', // Deep crimson
    borderColor: '#B85555',
  },

  // Pressed states
  primaryPressed: {
    backgroundColor: '#4A6249',
  },
  secondaryPressed: {
    backgroundColor: '#725F46',
  },
  outlinePressed: {
    backgroundColor: 'rgba(107, 159, 127, 0.2)',
  },
  ghostPressed: {
    backgroundColor: 'rgba(92, 122, 94, 0.15)',
  },
  dangerPressed: {
    backgroundColor: '#723636',
  },

  // Size styles
  sm: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  md: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  lg: {
    paddingHorizontal: 26,
    paddingVertical: 18,
  },

  // Text styles
  text: {
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    position: 'relative',
    zIndex: 1,
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
    color: '#F9F5EB', // Light parchment
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  textSecondary: {
    color: '#F0E8D5', // Parchment
  },
  textOutline: {
    color: '#5C7A5E', // Forest green
    fontWeight: '700',
  },
  textGhost: {
    color: '#6B9F7F', // Natural green
  },
  textDanger: {
    color: '#FFE5E5',
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
    position: 'relative',
    zIndex: 1,
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
  const loadingColor = variant === 'outline' ? '#5C7A5E' : '#F0E8D5';

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
          // Magical glow shadow (druidic green for primary, natural for others)
          shadowColor: variant === 'primary' ? '#7FD1A8' : (variant === 'danger' ? '#B85555' : '#2C1810'),
          shadowOffset: { width: 0, height: pressed ? 3 : 6 },
          shadowOpacity: pressed ? 0.4 : 0.7,
          shadowRadius: pressed ? 10 : 18,
          elevation: pressed ? 6 : 12,
        },
      ]}
      {...props}
    >
      {/* Magical energy overlay for primary buttons */}
      {variant === 'primary' && <View style={styles.magicOverlay} />}

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
