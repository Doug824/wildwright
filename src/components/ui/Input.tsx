/**
 * Input Component - Text input fields for the WildWright UI
 *
 * Themed text input with label, error state, and helper text.
 * Supports all standard TextInput props.
 */

import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useState } from 'react';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#8B7355', // Dark brown for contrast on parchment
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  input: {
    backgroundColor: '#234235', // Forest-800
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F9F5EB', // Parchment-50
  },
  inputFocused: {
    borderColor: '#B97A3D', // Bronze
    shadowColor: '#7FC9C0', // Cyan glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  inputUnfocused: {
    borderColor: '#2A4A3A', // Forest-600
  },
  inputError: {
    borderColor: '#EF4444', // Red-500
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
  },
  helperTextNormal: {
    color: '#D4C5A9', // Parchment-300
  },
  helperTextError: {
    color: '#FCA5A5', // Red-400
  },
});

export function Input({
  label,
  error,
  helper,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      {/* Input */}
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#DCCEB1"
        style={[
          styles.input,
          isFocused && !hasError && styles.inputFocused,
          !isFocused && !hasError && styles.inputUnfocused,
          hasError && styles.inputError,
          style,
        ]}
        {...props}
      />

      {/* Helper or Error Text */}
      {(helper || error) && (
        <Text
          style={[
            styles.helperText,
            hasError ? styles.helperTextError : styles.helperTextNormal,
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
}
