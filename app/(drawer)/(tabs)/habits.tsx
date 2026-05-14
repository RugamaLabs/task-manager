import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useHabits } from '@/hooks/use-habits';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchBar } from '@/components/ui/search-bar';
import { HabitCard } from '@/components/habits/habit-card';
import type { Habit } from '@/lib/types';

export default function HabitsScreen() {
  const colors = useColors();
  const { habits, loading, toggleCheckin, removeHabit } = useHabits();

  const [query, setQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const filteredHabits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter((h) => h.name.toLowerCase().includes(q));
  }, [habits, query]);

  const handleLongPress = (habit: Habit) => {
    Alert.alert(habit.name, '¿Qué deseas hacer?', [
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeHabit(habit.id),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Habits" onSearchPress={() => setSearchVisible((v) => !v)} />
      {searchVisible && (
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar hábitos"
            autoFocus
          />
        </View>
      )}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="analytics-outline"
            message="Aún no tienes hábitos"
            hint="Toca + en la barra inferior para crear uno"
          />
        </View>
      ) : filteredHabits.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="search-outline"
            message="Sin resultados"
            hint={`Ningún hábito coincide con "${query}"`}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {filteredHabits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onToggleDay={toggleCheckin}
              onLongPress={handleLongPress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
});
