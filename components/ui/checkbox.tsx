import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Props = {
  checked: boolean;
  onPress: () => void;
  /** Lado del cuadrado. Por defecto 24. */
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Etiqueta de accesibilidad (lo que lee el lector de pantalla). */
  accessibilityLabel?: string;
};

/** Casilla cuadrada: borde gris cuando está apagada, relleno azul con check cuando está activa. */
export function Checkbox({ checked, onPress, size = 24, style, accessibilityLabel }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[
        styles.box,
        { width: size, height: size },
        checked
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { borderColor: colors.border },
        style,
      ]}>
      {checked && <Ionicons name="checkmark" size={size * 0.7} color="#fff" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
