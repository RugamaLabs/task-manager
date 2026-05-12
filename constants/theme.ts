/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

/** Azul de marca usado en checks, días activos, tabs seleccionadas, etc. */
const primaryLight = '#1d4ed8';
const primaryDark = '#3b82f6';

const tintColorLight = primaryLight;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    /** Fondo general de las pantallas. */
    background: '#f8f9fb',
    /** Fondo de tarjetas y superficies elevadas. */
    card: '#ffffff',
    /** Fondo sutil para inputs/chips (search bar, celdas vacías de calendario). */
    surface: '#eef0f3',
    /** Texto secundario / metadatos. */
    muted: '#6b7280',
    /** Bordes de tarjetas, checkboxes apagados, separadores. */
    border: '#d1d5db',
    primary: primaryLight,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#101113',
    card: '#1c1e21',
    surface: '#26282c',
    muted: '#9BA1A6',
    border: '#3a3d42',
    primary: primaryDark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/** Espaciados base (en px). Usar para padding/margin/gap. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Radios de borde. */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
