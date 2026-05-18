import { addDays, format, startOfWeek } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { todayISODate, weekdayLabels } from '@/lib/date';

type Props = {
  /** Conjunto de fechas con eventos (`YYYY-MM-DD`). */
  eventDates: Set<string>;
};

/**
 * Mini calendario de 3 semanas (anterior, actual, siguiente) con:
 * - Header L M X J V S D.
 * - Hoy en círculo azul con número blanco.
 * - Días con eventos con un punto debajo.
 */
export function MiniCalendar({ eventDates }: Props) {
  const colors = useColors();
  const today = todayISODate();
  const baseMonday = startOfWeek(new Date(), { weekStartsOn: 1 });

  const weeks = [-1, 0, 1].map((offset) => {
    const monday = addDays(baseMonday, offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(monday, i);
      const iso = format(day, 'yyyy-MM-dd');
      return {
        iso,
        dayOfMonth: day.getDate(),
        isToday: iso === today,
        hasEvent: eventDates.has(iso),
      };
    });
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        {weekdayLabels.map((label) => (
          <Text key={label} style={[styles.headerCell, { color: colors.muted }]}>
            {label}
          </Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.row}>
          {week.map((d) => (
            <View key={d.iso} style={styles.cellWrap}>
              <View
                style={[
                  styles.cell,
                  { borderColor: colors.border },
                  d.isToday && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}>
                <Text
                  style={[
                    styles.cellText,
                    { color: d.isToday ? '#fff' : colors.text },
                  ]}>
                  {d.dayOfMonth}
                </Text>
              </View>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: d.hasEvent ? colors.primary : 'transparent' },
                ]}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  headerCell: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: Spacing.xs,
  },
  cellWrap: { alignItems: 'center', gap: 2 },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 13, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
