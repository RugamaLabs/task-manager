import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/use-settings';

export const unstable_settings = {
  anchor: '(drawer)',
};

/** Sub-componente que sabe el tema efectivo (system o forzado) y monta el ThemeProvider. */
function ThemedApp() {
  const { settings } = useSettings();
  const osScheme = useColorScheme();
  const effective =
    settings.theme === 'system' ? (osScheme ?? 'light') : settings.theme;

  return (
    <ThemeProvider value={effective === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="modals/add-task" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/add-habit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/add-post" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/add-event" options={{ presentation: 'modal' }} />
        <Stack.Screen name="posts/[id]" />
      </Stack>
      <StatusBar style={effective === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemedApp />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
