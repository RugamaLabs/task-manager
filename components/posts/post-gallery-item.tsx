import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { resolveCoverImageUri } from '@/lib/blocks';
import type { Post } from '@/lib/types';

type Props = {
  post: Post;
  onPress?: (post: Post) => void;
  onLongPress?: (post: Post) => void;
};

/** Ítem cuadrado del modo "Galería": cover + título debajo. */
export function PostGalleryItem({ post, onPress, onLongPress }: Props) {
  const colors = useColors();
  const cover = resolveCoverImageUri(post);

  return (
    <Pressable
      onPress={onPress ? () => onPress(post) : undefined}
      onLongPress={onLongPress ? () => onLongPress(post) : undefined}
      delayLongPress={350}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.7 }]}>
      <View style={[styles.imageWrap, { backgroundColor: colors.surface }]}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={36} color={colors.muted} />
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {post.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: Spacing.xs },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '600' },
});
