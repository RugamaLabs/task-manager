import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useColors } from '@/hooks/use-colors';
import { useTasks } from '@/hooks/use-tasks';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchBar } from '@/components/ui/search-bar';
import { TaskCategoryGroup } from '@/components/tasks/task-category-group';
import type { Task } from '@/lib/types';

export default function TasksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { categories } = useCategories();
  const { tasks, loading, toggleTask, removeTask } = useTasks();

  const [query, setQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, query]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, Task[]>();
    for (const t of filteredTasks) {
      const bucket = byCategory.get(t.category);
      if (bucket) bucket.push(t);
      else byCategory.set(t.category, [t]);
    }
    const ordered: { name: string; tasks: Task[] }[] = [];
    // Primero las categorías conocidas, en su orden
    for (const c of categories) {
      const items = byCategory.get(c.name);
      if (items && items.length > 0) {
        ordered.push({ name: c.name, tasks: items });
        byCategory.delete(c.name);
      }
    }
    // Después, cualquier categoría huérfana (eliminada pero con tareas)
    for (const [name, items] of byCategory) {
      ordered.push({ name, tasks: items });
    }
    return ordered;
  }, [filteredTasks, categories]);

  const handleLongPress = (task: Task) => {
    Alert.alert(task.title, '¿Qué deseas hacer?', [
      {
        text: 'Editar',
        onPress: () => router.push({ pathname: '/modals/add-task', params: { id: task.id } }),
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeTask(task.id),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Tasks" onSearchPress={() => setSearchVisible((v) => !v)} />
      {searchVisible && (
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar tareas" autoFocus />
        </View>
      )}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="checkmark-done-outline"
            message="Aún no tienes tareas"
            hint="Toca + en la barra inferior para crear una"
          />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="search-outline"
            message="Sin resultados"
            hint={`Ninguna tarea coincide con "${query}"`}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {groups.map((g) => (
            <TaskCategoryGroup
              key={g.name}
              categoryName={g.name}
              tasks={g.tasks}
              onToggleTask={toggleTask}
              onLongPressTask={handleLongPress}
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
