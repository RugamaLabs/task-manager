import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Devuelve la paleta completa (`Colors.light` o `Colors.dark`) según el esquema activo. */
export function useColors() {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}
