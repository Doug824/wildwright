/**
 * Input Component - Text input fields for the WildWright UI
 *
 * Themed text input with label, error state, and helper text.
 * Supports all standard TextInput props.
 */

import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helper,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  return (
    <View className={cn('mb-4', containerClassName)}>
      {/* Label */}
      {label && (
        <Text className="text-parchment-200 font-ui text-sm mb-2 uppercase tracking-wide">
          {label}
        </Text>
      )}

      {/* Input */}
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#DCCEB1"
        className={cn(
          'bg-forest-800 border-2 rounded-xl px-4 py-3 font-ui text-base text-parchment-50',
          isFocused && !hasError && 'border-bronze-500',
          !isFocused && !hasError && 'border-forest-600',
          hasError && 'border-red-500',
          className
        )}
        {...props}
      />

      {/* Helper or Error Text */}
      {(helper || error) && (
        <Text
          className={cn(
            'font-ui text-xs mt-2',
            hasError ? 'text-red-400' : 'text-parchment-300'
          )}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
}
