import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useEvents } from '@/hooks/use-events';
import { formatShortDate, todayISODate } from '@/lib/date';

/** Lista de los próximos eventos (fecha ≥ hoy, ordenados ascendente). Long-press → eliminar. */
export function UpcomingEvents() {
  const colors = useColors();
  const { events, removeEvent } = useEvents();
  const today = todayISODate();

  const upcoming = events.filter((e) => e.date >= today).slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.muted }}>No hay próximos eventos.</Text>
      </View>
    );
  }

  const handleLongPress = (id: string, title: string) => {
    Alert.alert(title, '¿Eliminar este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeEvent(id) },
    ]);
  };

  return (
    <View style={styles.list}>
      {upcoming.map((e) => (
        <Pressable
          key={e.id}
          onLongPress={() => handleLongPress(e.id, e.title)}
          delayLongPress={350}
          style={[
            styles.item,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {e.title}
          </Text>
          <Text style={[styles.date, { color: colors.muted }]}>{formatShortDate(e.date)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  item: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  title: { flex: 1, fontSize: 15, fontWeight: '600' },
  date: { fontSize: 13 },
  empty: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});
