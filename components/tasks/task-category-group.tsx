import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { Card } from '@/components/ui/card';
import { TaskCard } from '@/components/tasks/task-card';
import type { Task } from '@/lib/types';

type Props = {
  categoryName: string;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onLongPressTask?: (task: Task) => void;
};

/** Tarjeta con título de categoría y la lista de sus tareas. */
export function TaskCategoryGroup({ categoryName, tasks, onToggleTask, onLongPressTask }: Props) {
  const colors = useColors();
  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>{categoryName}</Text>
      <View style={styles.list}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onToggle={onToggleTask} onLongPress={onLongPressTask} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  list: {
    gap: Spacing.xs,
  },
});
