import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';

/** Etiqueta "STREAK" + número grande en azul, alineado a la derecha del nombre del hábito. */
export function StreakBadge({ count }: { count: number }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.muted }]}>STREAK</Text>
      <Text style={[styles.count, { color: colors.primary }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-end' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  count: { fontSize: 28, fontWeight: '800', lineHeight: 32 },
});
