/**
 * Select Component - Dropdown picker for the WildWright UI
 *
 * Themed select/picker component for choosing from a list of options.
 */

import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  helper?: string;
  containerClassName?: string;
}

export function Select({
  label,
  value,
  onValueChange,
  options,
  error,
  helper,
  containerClassName = '',
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <Text className="text-parchment-200 font-ui text-sm mb-2 uppercase tracking-wide">
          {label}
        </Text>
      )}

      {/* Picker */}
      <View
        className={`bg-forest-800 border-2 rounded-xl overflow-hidden ${
          isFocused && !hasError ? 'border-bronze-500' : ''
        }${!isFocused && !hasError ? 'border-forest-600' : ''}${
          hasError ? 'border-red-500' : ''
        }`}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            color: '#F0E8D5',
            backgroundColor: 'transparent',
          }}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              color="#1f3527"
            />
          ))}
        </Picker>
      </View>

      {/* Helper or Error Text */}
      {(helper || error) && (
        <Text
          className={`font-ui text-xs mt-2 ${
            hasError ? 'text-red-400' : 'text-parchment-300'
          }`}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
}
