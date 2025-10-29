// Jest setup file
// Add any global test configuration here

// Mock expo-haptics to avoid errors in tests
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  debug: jest.fn(),
  warn: jest.fn(),
};
