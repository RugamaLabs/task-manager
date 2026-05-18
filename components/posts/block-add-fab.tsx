import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useColors } from '@/hooks/use-colors';

type Props = {
  /** Posición vertical (top) relativa al contenedor del editor. */
  y: number;
  onPress: () => void;
};

/** Botón circular "+" anclado a la izquierda del bloque enfocado. */
export function BlockAddFab({ y, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Añadir bloque"
      style={({ pressed }) => [
        styles.fab,
        {
          top: y,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.6 },
      ]}>
      <Ionicons name="add" size={20} color={colors.primary} />
    </Pressable>
  );
}

const SIZE = 32;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
