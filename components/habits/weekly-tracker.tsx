import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { Checkbox } from '@/components/ui/checkbox';
import { currentWeekDays } from '@/lib/date';

type Props = {
  /** Fechas (`YYYY-MM-DD`) en las que el hábito está marcado. */
  checkins: string[];
  onToggle: (dateISO: string) => void;
};

/** Fila de 7 celdas (L–D) con la etiqueta del día arriba y una casilla cuadrada debajo. */
export function WeeklyTracker({ checkins, onToggle }: Props) {
  const colors = useColors();
  const days = currentWeekDays();
  const marked = new Set(checkins);

  return (
    <View style={styles.row}>
      {days.map((day) => (
        <View key={day.iso} style={styles.cell}>
          <Text style={[styles.label, { color: colors.muted }]}>{day.label}</Text>
          <Checkbox
            checked={marked.has(day.iso)}
            onPress={() => onToggle(day.iso)}
            size={36}
            accessibilityLabel={`Día ${day.label}`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  cell: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: { fontSize: 12, fontWeight: '700' },
});
