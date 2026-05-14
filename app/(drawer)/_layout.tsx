import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

import { useColors } from '@/hooks/use-colors';

/** Cajón lateral (se abre con el botón ☰). Contiene la app de tabs ("Inicio") y "Configuración". */
export default function DrawerLayout() {
  const colors = useColors();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
      }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Inicio',
          title: 'Inicio',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Configuración',
          title: 'Configuración',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}
