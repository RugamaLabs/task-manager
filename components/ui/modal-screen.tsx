import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { IconButton } from '@/components/ui/icon-button';

type Props = {
  title: string;
  children?: React.ReactNode;
};

/** Contenedor base de los modales: barra con título y botón de cerrar (✕) + contenido. */
export function ModalScreen({ title, children }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const close = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <IconButton name="close" onPress={close} accessibilityLabel="Cerrar" color={colors.text} />
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { flex: 1, fontSize: 20, fontWeight: '700' },
  body: { flex: 1, padding: Spacing.lg },
});
