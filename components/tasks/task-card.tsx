import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/lib/types';

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onLongPress?: (task: Task) => void;
};

/** Fila de tarea: casilla + título. Tachado si está completada. Long-press dispara acciones. */
export function TaskCard({ task, onToggle, onLongPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => onToggle(task.id)}
      onLongPress={onLongPress ? () => onLongPress(task) : undefined}
      delayLongPress={350}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Checkbox
        checked={task.completed}
        onPress={() => onToggle(task.id)}
        accessibilityLabel={task.title}
      />
      <Text
        style={[
          styles.title,
          {
            color: task.completed ? colors.muted : colors.text,
            textDecorationLine: task.completed ? 'line-through' : 'none',
          },
        ]}
        numberOfLines={2}>
        {task.title}
      </Text>
      <View />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.6,
  },
});
