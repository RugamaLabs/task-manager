import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useEvents } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { ModalScreen } from '@/components/ui/modal-screen';
import { formatShortDate, toISODate, todayISODate } from '@/lib/date';
import { addDays, parseISO } from 'date-fns';

type Quick = { label: string; iso: string };

function quickOptions(): Quick[] {
  const today = new Date();
  return [
    { label: 'Hoy', iso: todayISODate() },
    { label: 'Mañana', iso: toISODate(addDays(today, 1)) },
    { label: 'En 1 semana', iso: toISODate(addDays(today, 7)) },
  ];
}

function isValidISODate(input: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const parsed = parseISO(input);
  return !Number.isNaN(parsed.getTime());
}

export default function AddEventModal() {
  const colors = useColors();
  const router = useRouter();
  const { addEvent } = useEvents();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISODate());

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe un título para el evento.');
      return;
    }
    if (!isValidISODate(date)) {
      Alert.alert('Fecha inválida', 'Usa el formato YYYY-MM-DD.');
      return;
    }
    const created = addEvent({ title, date });
    if (!created) return;
    if (router.canGoBack()) router.back();
  };

  const quicks = quickOptions();

  return (
    <ModalScreen title="Nuevo evento">
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.text }]}>Título</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ej. Reunión con clientes"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          autoFocus
        />

        <Text style={[styles.label, { color: colors.text }]}>Fecha</Text>
        <View style={styles.quickRow}>
          {quicks.map((q) => {
            const active = q.iso === date;
            return (
              <Pressable
                key={q.iso}
                onPress={() => setDate(q.iso)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.chipLabel, { color: active ? '#fff' : colors.text }]}>
                  {q.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
        />
        {isValidISODate(date) && (
          <Text style={[styles.hint, { color: colors.muted }]}>
            {formatShortDate(date)}
          </Text>
        )}
      </View>
      <Button label="Crear evento" onPress={handleSave} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.sm, marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: '600', marginTop: Spacing.sm },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  quickRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 13, marginTop: Spacing.xs },
});
