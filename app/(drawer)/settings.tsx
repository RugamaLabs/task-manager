import { useState } from 'react';
import {
  Alert,
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
import { Card } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { ScreenHeader } from '@/components/ui/screen-header';

export default function SettingsScreen() {
  const colors = useColors();
  const { categories, addCategory, removeCategory } = useCategories();
  const { tasks } = useTasks();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = () => {
    const created = addCategory(newCategoryName);
    if (!created) {
      Alert.alert('Nombre inválido', 'Escribe un nombre para la categoría.');
      return;
    }
    setNewCategoryName('');
  };

  const handleRemove = (id: string, name: string) => {
    const affected = tasks.filter((t) => t.category === name).length;
    const message =
      affected > 0
        ? `Hay ${affected} tarea${affected === 1 ? '' : 's'} en "${name}". Quedarán sin categoría visible hasta que las edites.`
        : `¿Eliminar la categoría "${name}"?`;
    Alert.alert('Eliminar categoría', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeCategory(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Configuración" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorías</Text>
        <Card>
          <View style={styles.addRow}>
            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Agregar categoría"
              placeholderTextColor={colors.muted}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />
            <Button label="Agregar" onPress={handleAdd} style={styles.addButton} />
          </View>
          {categories.length === 0 ? (
            <Text style={[styles.empty, { color: colors.muted }]}>
              No hay categorías. Agrega una para empezar.
            </Text>
          ) : (
            <View style={styles.list}>
              {categories.map((c, idx) => (
                <View
                  key={c.id}
                  style={[
                    styles.row,
                    idx > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                  ]}>
                  <Text style={[styles.rowText, { color: colors.text }]}>{c.name}</Text>
                  <IconButton
                    name="trash-outline"
                    onPress={() => handleRemove(c.id, c.name)}
                    accessibilityLabel={`Eliminar categoría ${c.name}`}
                    color={colors.muted}
                  />
                </View>
              ))}
            </View>
          )}
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>
          Apariencia
        </Text>
        <Card>
          <Text style={[styles.empty, { color: colors.muted }]}>
            El selector de tema se agrega en la Fase 7.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  addButton: { height: 44, paddingHorizontal: Spacing.lg },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  rowText: { fontSize: 16 },
  empty: { fontSize: 14, paddingVertical: Spacing.sm },
});
