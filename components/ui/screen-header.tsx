import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { IconButton } from '@/components/ui/icon-button';

type Props = {
  title: string;
  /**
   * Si se pasa, se muestra el ícono de lupa a la derecha y se llama al tocarlo
   * (típicamente para mostrar/ocultar la `SearchBar` de la pantalla).
   */
  onSearchPress?: () => void;
};

/** Cabecera de pantalla: menú (☰) a la izquierda que abre el Drawer, título y lupa opcional. */
export function ScreenHeader({ title, onSearchPress }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <IconButton
        name="menu"
        onPress={openDrawer}
        accessibilityLabel="Abrir menú"
        color={colors.text}
      />
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {onSearchPress ? (
          <IconButton
            name="search"
            onPress={onSearchPress}
            accessibilityLabel="Buscar"
            color={colors.text}
          />
        ) : null}
      </View>
    </View>
  );
}

const ICON_SLOT = 40;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
  },
  right: {
    minWidth: ICON_SLOT,
    alignItems: 'flex-end',
  },
});
