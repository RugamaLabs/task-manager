import { Text, StyleSheet, type TextProps } from 'react-native';

import { useColors } from '@/hooks/use-colors';

/** Título de sección en negrita (p. ej. "Próximas Tareas", "Visitados recientemente"). */
export function SectionTitle({ style, children, ...rest }: TextProps) {
  const colors = useColors();
  return (
    <Text style={[styles.title, { color: colors.text }, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
});
