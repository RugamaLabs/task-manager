import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Spacing } from '@/constants/theme';

/** Visor full-screen para una imagen embebida. Fondo negro, sin crop (contentFit: contain). */
export default function ImageViewerModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  if (!uri) {
    if (router.canGoBack()) router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} contentFit="contain" />
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        hitSlop={12}
        style={[styles.closeButton, { top: insets.top + Spacing.sm }]}>
        <Ionicons name="close" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, width: '100%' },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
