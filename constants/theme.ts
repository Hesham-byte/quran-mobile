import { Platform } from 'react-native';

const tintColor = '#4fc3f7';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    tint: tintColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColor,
  },
  dark: {
    text: '#e8e8e8',
    background: '#121212',
    backgroundSecondary: '#1e1e1e',
    tint: tintColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColor,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});