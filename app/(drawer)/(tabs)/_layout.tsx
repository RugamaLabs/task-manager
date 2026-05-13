import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { useColors } from '@/hooks/use-colors';

/**
 * Barra de pestañas inferior: Tasks, Habits, Posts, Add.
 * "Add" no es una pantalla: al tocarla se abre el modal de creación que corresponde
 * a la pestaña en la que estás. "index" (Home) está oculta de la barra (se llega por el Drawer).
 */
export default function TabsLayout() {
  const colors = useColors();
  const router = useRouter();
  const segments = useSegments();

  const openAddModalForCurrentTab = () => {
    const current = segments[segments.length - 1];
    if (current === 'habits') {
      router.push('/modals/add-habit');
    } else if (current === 'posts') {
      router.push('/modals/add-post');
    } else {
      // Tasks y Home (y cualquier otro caso) → crear tarea.
      router.push('/modals/add-task');
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.icon,
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: 'Posts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            openAddModalForCurrentTab();
          },
        }}
      />
    </Tabs>
  );
}
