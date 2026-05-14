import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
};

/** Campo de búsqueda con ícono de lupa y fondo sutil. */
export function SearchBar({ value, onChangeText, placeholder = 'Buscar', style, autoFocus }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});
