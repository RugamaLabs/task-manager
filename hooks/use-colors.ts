import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/use-settings';

/**
 * Devuelve la paleta efectiva según la preferencia del usuario:
 * - `light`/`dark`: fuerza ese tema.
 * - `system` (default): usa lo que reporta el SO.
 */
export function useColors() {
  const { settings } = useSettings();
  const osScheme = useColorScheme() ?? 'light';
  const effective = settings.theme === 'system' ? osScheme : settings.theme;
  return Colors[effective];
}
