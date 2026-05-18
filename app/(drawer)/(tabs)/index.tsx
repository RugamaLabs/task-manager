import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useEvents } from '@/hooks/use-events';
import { IconButton } from '@/components/ui/icon-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionTitle } from '@/components/ui/section-title';
import { MiniCalendar } from '@/components/home/mini-calendar';
import { RecentPosts } from '@/components/home/recent-posts';
import { UpcomingEvents } from '@/components/home/upcoming-events';
import { UpcomingTasks } from '@/components/home/upcoming-tasks';

/** Dashboard Home: posts recientes, próximos eventos + mini calendario, próximas tareas. */
export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { events } = useEvents();

  const eventDates = useMemo(
    () => new Set(events.map((e) => e.date.slice(0, 10))),
    [events],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Home" />
      <ScrollView contentContainerStyle={styles.body}>
        <SectionTitle>Visitados recientemente</SectionTitle>
        <RecentPosts />

        <View style={styles.sectionHeader}>
          <SectionTitle>Próximos Eventos</SectionTitle>
          <IconButton
            name="add-circle"
            onPress={() => router.push('/modals/add-event')}
            accessibilityLabel="Agregar evento"
            color={colors.primary}
            size={28}
          />
        </View>
        <View style={styles.eventsBlock}>
          <UpcomingEvents />
          <MiniCalendar eventDates={eventDates} />
        </View>

        <SectionTitle>Próximas Tareas</SectionTitle>
        <UpcomingTasks />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  eventsBlock: { gap: Spacing.md },
});
