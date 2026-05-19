import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image as RNImage, Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';

type Props = {
  uri: string;
};

const ASPECT_16_9 = 16 / 9;
const ASPECT_4_3 = 4 / 3;

/**
 * Renderer custom para imágenes embebidas en Markdown. Usa `expo-image` con un
 * aspectRatio configurable via `useSettings.postImageAspect`. Tap → visor full-screen.
 *
 * Para el modo `'auto'` calcula la proporción real con `Image.getSize` de RN;
 * mientras carga muestra la imagen con 16:9 como fallback temporal.
 */
export function MarkdownImage({ uri }: Props) {
  const { settings } = useSettings();
  const router = useRouter();
  const [aspectRatio, setAspectRatio] = useState<number>(() => {
    if (settings.postImageAspect === '4:3') return ASPECT_4_3;
    return ASPECT_16_9;
  });

  useEffect(() => {
    if (settings.postImageAspect === '16:9') {
      setAspectRatio(ASPECT_16_9);
      return;
    }
    if (settings.postImageAspect === '4:3') {
      setAspectRatio(ASPECT_4_3);
      return;
    }
    // 'auto': calcular dimensiones reales.
    let cancelled = false;
    RNImage.getSize(
      uri,
      (w, h) => {
        if (cancelled) return;
        if (w > 0 && h > 0) setAspectRatio(w / h);
      },
      () => {
        if (cancelled) return;
        setAspectRatio(ASPECT_16_9);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [uri, settings.postImageAspect]);

  const handlePress = () => {
    router.push({ pathname: '/modals/image-viewer', params: { uri } });
  };

  return (
    <Pressable onPress={handlePress} accessibilityRole="image" accessibilityLabel="Ver imagen">
      <Image
        source={{ uri }}
        style={[styles.image, { aspectRatio }]}
        contentFit="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: Radius.md,
    marginVertical: Spacing.sm,
  },
});
