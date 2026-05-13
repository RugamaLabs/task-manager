import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';

type Props = {
  title: string;
  /** Texto del placeholder. Por defecto "Próximamente". */
  message?: string;
};

/** Pantalla provisional: cabecera + mensaje centrado. Se irá reemplazando fase por fase. */
export function PlaceholderScreen({ title, message = 'Próximamente' }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={title} />
      <View style={styles.body}>
        <EmptyState icon="construct-outline" message={message} hint={`Pantalla "${title}" en construcción`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
});
