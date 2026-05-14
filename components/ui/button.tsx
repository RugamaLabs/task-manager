import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Botón táctil con variantes. `primary` = azul de marca; `secondary` = gris; `danger` = rojo. */
export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const colors = useColors();
  const bg =
    variant === 'primary' ? colors.primary : variant === 'danger' ? '#dc2626' : colors.surface;
  const fg = variant === 'secondary' ? colors.text : '#fff';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
