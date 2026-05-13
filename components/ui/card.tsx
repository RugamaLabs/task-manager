import { View, StyleSheet, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Props = ViewProps & {
  /** Padding interno. Por defecto `Spacing.lg`. Pasar `0` para controlarlo desde dentro. */
  padding?: number;
};

/** Superficie blanca con esquinas redondeadas y sombra suave. Bloque base de las pantallas. */
export function Card({ style, padding = Spacing.lg, children, ...rest }: Props) {
  const colors = useColors();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, padding }, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
