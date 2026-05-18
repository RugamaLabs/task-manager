import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { resolveCoverImageUri } from '@/lib/blocks';
import { formatShortDate } from '@/lib/date';
import type { Post } from '@/lib/types';

type Props = {
  post: Post;
  onLongPress?: (post: Post) => void;
};

/** Fila compacta para el modo "Lista" de Posts. */
export function PostListRow({ post, onLongPress }: Props) {
  const colors = useColors();
  const cover = resolveCoverImageUri(post);

  return (
    <Pressable
      onLongPress={onLongPress ? () => onLongPress(post) : undefined}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}>
      {cover ? (
        <Image source={{ uri: cover }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.placeholder, { backgroundColor: colors.surface }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.muted} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {post.title}
        </Text>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formatShortDate(post.updatedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  thumb: { width: 48, height: 48, borderRadius: Radius.sm },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  date: { fontSize: 12 },
});
