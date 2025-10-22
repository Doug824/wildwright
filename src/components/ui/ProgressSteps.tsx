/**
 * ProgressSteps Component - Step indicator for multi-step forms
 *
 * Shows current progress through a multi-step flow with bronze/mist styling.
 */

import { View, Text } from 'react-native';

export interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className = '' }: ProgressStepsProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {/* Step Labels */}
      <View className="flex-row justify-between mb-2">
        {steps.map((step, index) => (
          <Text
            key={step}
            className={`font-ui text-xs ${
              index <= currentStep
                ? 'text-mist-300 font-semibold'
                : 'text-parchment-300'
            }`}
          >
            {step}
          </Text>
        ))}
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-forest-600 rounded-full overflow-hidden">
        <View
          className="h-full bg-mist-500 rounded-full"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            shadowColor: '#7FC9C0',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 4,
          }}
        />
      </View>

      {/* Step Numbers */}
      <View className="flex-row justify-between mt-3">
        {steps.map((_, index) => (
          <View
            key={index}
            className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
              index < currentStep
                ? 'bg-mist-500 border-mist-400'
                : index === currentStep
                ? 'bg-transparent border-mist-500'
                : 'bg-transparent border-forest-600'
            }`}
            style={
              index === currentStep
                ? {
                    shadowColor: '#7FC9C0',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 6,
                  }
                : undefined
            }
          >
            <Text
              className={`font-ui text-sm font-bold ${
                index <= currentStep ? 'text-parchment-50' : 'text-parchment-300'
              }`}
            >
              {index + 1}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
