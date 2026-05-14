import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useHabits } from '@/hooks/use-habits';
import { Button } from '@/components/ui/button';
import { ModalScreen } from '@/components/ui/modal-screen';

export default function AddHabitModal() {
  const colors = useColors();
  const router = useRouter();
  const { addHabit } = useHabits();
  const [name, setName] = useState('');

  const handleSave = () => {
    const created = addHabit(name);
    if (!created) {
      Alert.alert('Falta el nombre', 'Escribe un nombre para el hábito.');
      return;
    }
    if (router.canGoBack()) router.back();
  };

  return (
    <ModalScreen title="Nuevo hábito">
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Leer 20 minutos"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          autoFocus
          onSubmitEditing={handleSave}
          returnKeyType="done"
        />
        <Text style={[styles.hint, { color: colors.muted }]}>
          Después podrás marcar cada día de la semana en su tarjeta.
        </Text>
      </View>
      <Button label="Crear hábito" onPress={handleSave} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.sm, marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  hint: { fontSize: 13, marginTop: Spacing.xs },
});
