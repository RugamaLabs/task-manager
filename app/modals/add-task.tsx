import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useColors } from '@/hooks/use-colors';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { ModalScreen } from '@/components/ui/modal-screen';

export default function AddTaskModal() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { categories, addCategory } = useCategories();
  const { addTask, editTask, getTaskById } = useTasks();

  const editing = useMemo(() => (id ? getTaskById(id) : undefined), [id, getTaskById]);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    editing?.category ?? categories[0]?.name ?? '',
  );
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const isEdit = Boolean(editing);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe un título para la tarea.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Falta la categoría', 'Elige o crea una categoría.');
      return;
    }
    if (isEdit && editing) {
      editTask(editing.id, { title: title.trim(), category: selectedCategory });
    } else {
      addTask({ title: title.trim(), category: selectedCategory });
    }
    if (router.canGoBack()) router.back();
  };

  const handleCreateCategory = () => {
    const created = addCategory(newCategoryName);
    if (!created) {
      Alert.alert('Nombre inválido', 'Escribe un nombre para la categoría.');
      return;
    }
    setSelectedCategory(created.name);
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  return (
    <ModalScreen title={isEdit ? 'Editar tarea' : 'Nueva tarea'}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.text }]}>Título</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="¿Qué tarea quieres anotar?"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          autoFocus={!isEdit}
        />

        <Text style={[styles.label, { color: colors.text }]}>Categoría</Text>
        <View style={styles.chips}>
          {categories.map((c) => {
            const active = c.name === selectedCategory;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelectedCategory(c.name)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.chipLabel, { color: active ? '#fff' : colors.text }]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setShowNewCategoryInput((v) => !v)}
            style={[styles.chip, styles.chipDashed, { borderColor: colors.border }]}>
            <Text style={[styles.chipLabel, { color: colors.muted }]}>
              {showNewCategoryInput ? '✕ Cancelar' : '+ Nueva categoría'}
            </Text>
          </Pressable>
        </View>

        {showNewCategoryInput && (
          <View style={styles.newCategoryRow}>
            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nombre de la categoría"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                styles.newCategoryInput,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
              ]}
              onSubmitEditing={handleCreateCategory}
              returnKeyType="done"
              autoFocus
            />
            <Button label="Crear" onPress={handleCreateCategory} style={styles.createButton} />
          </View>
        )}
      </ScrollView>

      <Button label={isEdit ? 'Guardar cambios' : 'Crear tarea'} onPress={handleSave} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: Spacing.lg, gap: Spacing.sm },
  label: { fontSize: 14, fontWeight: '600', marginTop: Spacing.sm },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipDashed: { borderStyle: 'dashed' },
  chipLabel: { fontSize: 14, fontWeight: '600' },
  newCategoryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  newCategoryInput: { flex: 1 },
  createButton: { paddingHorizontal: Spacing.md, height: 48 },
});
