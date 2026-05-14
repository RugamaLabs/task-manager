import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Props = {
  /** Ícono ilustrativo (de Ionicons). */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Mensaje principal, p. ej. "Aún no tienes tareas". */
  message: string;
  /** Texto secundario opcional con una pista de qué hacer. */
  hint?: string;
};

/** Bloque centrado que se muestra cuando una lista está vacía. */
export function EmptyState({ icon = 'file-tray-outline', message, hint }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.muted} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {hint ? <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
  },
});
