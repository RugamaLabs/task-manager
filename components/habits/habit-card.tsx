import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { Card } from '@/components/ui/card';
import { StreakBadge } from '@/components/habits/streak-badge';
import { WeeklyTracker } from '@/components/habits/weekly-tracker';
import { calculateStreak } from '@/lib/streak';
import type { Habit } from '@/lib/types';

type Props = {
  habit: Habit;
  onToggleDay: (habitId: string, dateISO: string) => void;
  onLongPress?: (habit: Habit) => void;
};

/** Tarjeta de hábito: nombre + racha + tracker semanal. Long-press → acciones del padre. */
export function HabitCard({ habit, onToggleDay, onLongPress }: Props) {
  const colors = useColors();
  const streak = calculateStreak(habit.checkins);

  return (
    <Card style={styles.card}>
      <Pressable
        onLongPress={onLongPress ? () => onLongPress(habit) : undefined}
        delayLongPress={350}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {habit.name}
          </Text>
          <StreakBadge count={streak} />
        </View>
        <WeeklyTracker
          checkins={habit.checkins}
          onToggle={(iso) => onToggleDay(habit.id, iso)}
        />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  name: { flex: 1, fontSize: 18, fontWeight: '700' },
});
