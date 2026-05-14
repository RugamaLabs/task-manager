# Task Manager — Navegación Anidada (Drawer → Tabs → Stack)

Este proyecto, construido con **React Native + Expo Router**, implementa los tres niveles de navegación solicitados en el laboratorio. Expo Router usa *file-based routing*, por lo que la jerarquía de carpetas dentro de [app/](app/) **es** la jerarquía de navegadores.

```
app/
├── _layout.tsx              ← Stack raíz (Nivel 3 base + modales)
├── (drawer)/
│   ├── _layout.tsx          ← Nivel 1: Drawer Navigator
│   ├── settings.tsx         ← Pantalla "Configuración" del Drawer
│   └── (tabs)/
│       ├── _layout.tsx      ← Nivel 2: Bottom Tab Navigator
│       ├── index.tsx        ← Home (oculta de la barra)
│       ├── tasks.tsx        ← Tab "Tasks"
│       ├── habits.tsx       ← Tab "Habits"
│       ├── posts.tsx        ← Tab "Posts"
│       └── add.tsx          ← Tab "Add" (dispara modal, no navega)
└── modals/
    ├── add-task.tsx         ← Vista de detalle (push sobre el Stack raíz)
    ├── add-habit.tsx
    └── add-post.tsx
```

---

## Nivel 1 — Drawer Navigator (contenedor principal)

El menú lateral se define en [app/(drawer)/_layout.tsx](app/(drawer)/_layout.tsx). Usa el componente `Drawer` de `expo-router/drawer` y registra dos entradas: **Inicio** (que apunta al grupo de tabs) y **Configuración**.

```tsx
// app/(drawer)/_layout.tsx
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer screenOptions={{ headerShown: false, drawerActiveTintColor: colors.primary }}>
      <Drawer.Screen
        name="(tabs)"
        options={{ drawerLabel: 'Inicio', title: 'Inicio', drawerIcon: ... }}
      />
      <Drawer.Screen
        name="settings"
        options={{ drawerLabel: 'Configuración', title: 'Configuración', drawerIcon: ... }}
      />
    </Drawer>
  );
}
```

- `name="(tabs)"` referencia la carpeta `(tabs)/`, donde vive el siguiente navegador anidado.
- `name="settings"` referencia [app/(drawer)/settings.tsx](app/(drawer)/settings.tsx), una pantalla hermana sin tabs (sirve para mostrar que el Drawer puede contener tanto un sub-navegador como pantallas simples).

El paréntesis en `(drawer)` indica que es un **grupo de rutas**: agrupa archivos bajo un layout compartido sin añadir un segmento a la URL.

---

## Nivel 2 — Bottom Tab Navigator (dentro de una pantalla del Drawer)

Dentro de la pantalla "Inicio" del Drawer se monta un **Tab Navigator** definido en [app/(drawer)/(tabs)/_layout.tsx](app/(drawer)/(tabs)/_layout.tsx). Esto crea la barra inferior que aparece **solo cuando el usuario está en "Inicio"**; al cambiar al ítem "Configuración" del Drawer, la barra desaparece.

```tsx
// app/(drawer)/(tabs)/_layout.tsx
import { Tabs, useRouter, useSegments } from 'expo-router';

export default function TabsLayout() {
  // ...
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarButton: HapticTab, ... }}>
      <Tabs.Screen name="index" options={{ href: null }} />     {/* Home oculta */}
      <Tabs.Screen name="tasks"  options={{ title: 'Tasks',  tabBarIcon: ... }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits', tabBarIcon: ... }} />
      <Tabs.Screen name="posts"  options={{ title: 'Posts',  tabBarIcon: ... }} />
      <Tabs.Screen
        name="add"
        options={{ title: 'Add', tabBarIcon: ... }}
        listeners={{ tabPress: (e) => { e.preventDefault(); openAddModalForCurrentTab(); } }}
      />
    </Tabs>
  );
}
```

Detalles concretos:

- Las pestañas Tasks, Habits y Posts son archivos hermanos: [tasks.tsx](app/(drawer)/(tabs)/tasks.tsx), [habits.tsx](app/(drawer)/(tabs)/habits.tsx), [posts.tsx](app/(drawer)/(tabs)/posts.tsx).
- La pestaña **"Add"** intercepta `tabPress` con `e.preventDefault()` y dispara `router.push(...)` hacia el modal correcto según la tab activa (`useSegments()` devuelve la ruta actual). Esto demuestra cómo una pestaña puede actuar como *trigger* en lugar de navegar a una pantalla.
- `index.tsx` se oculta de la barra con `href: null` porque el acceso a "Inicio" se hace desde el Drawer.

---

## Nivel 3 — Stack Navigator (vistas de detalle desde una tab)

El Stack raíz se declara en [app/_layout.tsx](app/_layout.tsx). Sobre él se montan tanto el grupo `(drawer)` como las **pantallas de detalle** que se abren desde dentro de una tab:

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export const unstable_settings = { anchor: '(drawer)' };

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={...}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="modals/add-task"  options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/add-habit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/add-post"  options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

El push al Stack se ejecuta desde una pantalla que vive dentro de una tab. Ejemplo concreto en [app/(drawer)/(tabs)/tasks.tsx:63](app/(drawer)/(tabs)/tasks.tsx#L63), donde al mantener presionada una tarea se abre la vista de edición como detalle:

```tsx
// app/(drawer)/(tabs)/tasks.tsx (extracto)
const handleLongPress = (task: Task) => {
  Alert.alert(task.title, '¿Qué deseas hacer?', [
    {
      text: 'Editar',
      onPress: () => router.push({ pathname: '/modals/add-task', params: { id: task.id } }),
    },
    { text: 'Eliminar', style: 'destructive', onPress: () => removeTask(task.id) },
    { text: 'Cancelar', style: 'cancel' },
  ]);
};
```

`router.push(...)` apila la pantalla [app/modals/add-task.tsx](app/modals/add-task.tsx) por encima del Drawer. El parámetro `id` se lee en el modal con `useLocalSearchParams<{ id?: string }>()`, lo que demuestra el paso de parámetros entre pantallas del Stack.

---

## Cómo se relacionan los tres niveles

La jerarquía efectiva en runtime es:

```
Stack raíz  (app/_layout.tsx)
├── (drawer)                                  ← Nivel 1
│   ├── (tabs)                                ← Nivel 2 (anidado dentro de "Inicio")
│   │   ├── tasks  ──► router.push('/modals/add-task')   ─┐
│   │   ├── habits ──► router.push('/modals/add-habit')   ├─► Nivel 3
│   │   └── posts  ──► router.push('/modals/add-post')   ─┘
│   └── settings
└── modals/*                                  ← Nivel 3 (hermanos del Drawer en el Stack)
```

- El **Stack raíz** envuelve todo: por eso los modales de detalle pueden aparecer **encima del Drawer y de las Tabs** sin perder el contexto del navegador inferior.
- El **Drawer** vive como una pantalla dentro de ese Stack, y a su vez contiene como una de sus pantallas al **Tab Navigator**.
- Las **Tabs** son las que disparan los `router.push` hacia las rutas del Nivel 3, cerrando el circuito: tab → stack push → detalle → `router.back()` para volver a la tab original.
- `unstable_settings.anchor = '(drawer)'` en [app/_layout.tsx:9-11](app/_layout.tsx#L9-L11) garantiza que el "ancla" del Stack es el Drawer, de modo que al hacer back desde un modal siempre se regresa al árbol Drawer/Tabs y no a una ruta huérfana.

Con esta composición, una misma app coordina los tres patrones de navegación móvil más comunes (lateral, inferior y apilada) sin acoplamientos manuales: la estructura de carpetas en [app/](app/) **es** la configuración del enrutamiento.

---

## Cómo correr el proyecto

```bash
npm install
npx expo start
```

Luego abrir en un emulador Android, simulador iOS o **Expo Go**.
