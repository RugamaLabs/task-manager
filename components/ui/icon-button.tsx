import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Props = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  /** `true` para el botón cuadrado con fondo gris (sort, "..."); `false` para solo el ícono. */
  filled?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Botón táctil con un ícono. Variante `filled` = cuadrado con fondo (como en las cabeceras). */
export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  size = 22,
  filled = false,
  color,
  style,
}: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        filled && [styles.filled, { backgroundColor: colors.surface }],
        pressed && styles.pressed,
        style,
      ]}>
      <Ionicons name={name} size={size} color={color ?? colors.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
  },
  pressed: {
    opacity: 0.6,
  },
});
