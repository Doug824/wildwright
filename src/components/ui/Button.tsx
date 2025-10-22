/**
 * Button Component - Interactive buttons for the WildWright UI
 *
 * Supports multiple variants (primary, secondary, outline, ghost) and sizes.
 * Includes loading state with spinner.
 */

import { Pressable, Text, ActivityIndicator, View, PressableProps } from 'react-native';
import { cn } from '@/utils/cn';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Variant styles
  const variantClasses = {
    primary: 'bg-bronze-500 border-bronze-600',
    secondary: 'bg-forest-600 border-forest-700',
    outline: 'bg-transparent border-bronze-500',
    ghost: 'bg-transparent border-transparent',
    danger: 'bg-red-600 border-red-700',
  };

  const variantTextClasses = {
    primary: 'text-parchment-50',
    secondary: 'text-parchment-100',
    outline: 'text-bronze-500',
    ghost: 'text-parchment-200',
    danger: 'text-white',
  };

  const pressedVariantClasses = {
    primary: 'bg-bronze-600',
    secondary: 'bg-forest-700',
    outline: 'bg-bronze-500/10',
    ghost: 'bg-forest-600/20',
    danger: 'bg-red-700',
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const sizeTextClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        'rounded-xl border-2 items-center justify-center flex-row',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className
      )}
      style={({ pressed }) => [
        {
          shadowColor: variant === 'primary' || variant === 'danger' ? '#000' : undefined,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: pressed ? 0.1 : 0.2,
          shadowRadius: pressed ? 2 : 4,
          elevation: pressed ? 2 : 4,
        },
      ]}
      {...props}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'flex-row items-center justify-center',
            pressed && !isDisabled && pressedVariantClasses[variant]
          )}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color={variant === 'outline' ? '#B97A3D' : '#F0E8D5'}
              className="mr-2"
            />
          )}
          <Text
            className={cn(
              'font-ui font-semibold',
              sizeTextClasses[size],
              variantTextClasses[variant]
            )}
          >
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
