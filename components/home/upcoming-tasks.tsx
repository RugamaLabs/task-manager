import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useTasks } from '@/hooks/use-tasks';
import { Card } from '@/components/ui/card';
import { TaskCard } from '@/components/tasks/task-card';

/** Tarjeta con las próximas tareas (no completadas, máximo 5). Toggle directo. */
export function UpcomingTasks() {
  const colors = useColors();
  const { tasks, toggleTask } = useTasks();

  const pending = tasks.filter((t) => !t.completed).slice(0, 5);

  return (
    <Card>
      {pending.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>
          ¡Sin pendientes! No tienes tareas por hacer.
        </Text>
      ) : (
        <View style={styles.list}>
          {pending.map((t) => (
            <TaskCard key={t.id} task={t} onToggle={toggleTask} />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.xs },
  empty: { textAlign: 'center', fontSize: 14, paddingVertical: Spacing.md },
});
