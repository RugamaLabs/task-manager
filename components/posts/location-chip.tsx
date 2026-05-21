import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Props = {
  name: string;
  /** Tamaño compacto para card/lista. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Chip con ícono de ubicación + nombre del lugar (una línea, con elipsis). */
export function LocationChip({ name, compact, style }: Props) {
  const colors = useColors();
  const fontSize = compact ? 12 : 14;
  const iconSize = compact ? 13 : 16;
  return (
    <View style={[styles.row, style]}>
      <Ionicons name="location" size={iconSize} color={colors.muted} />
      <Text style={[styles.text, { color: colors.muted, fontSize }]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  text: { flex: 1, fontWeight: '500' },
});
