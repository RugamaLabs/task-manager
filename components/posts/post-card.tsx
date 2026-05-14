import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { Card } from '@/components/ui/card';
import { MarkdownView } from '@/components/posts/markdown-view';
import { formatShortDate } from '@/lib/date';
import type { Post } from '@/lib/types';

const PREVIEW_CHAR_LIMIT = 180;

type Props = {
  post: Post;
  onLongPress?: (post: Post) => void;
};

function truncateMarkdown(input: string, limit: number): string {
  if (input.length <= limit) return input;
  // Corte sencillo: en el último espacio antes del límite para no romper palabras.
  const slice = input.slice(0, limit);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + '…';
}

/** Tarjeta de un post: título, descripción Markdown (truncada), fechas e imagen opcional. */
export function PostCard({ post, onLongPress }: Props) {
  const colors = useColors();
  const preview = truncateMarkdown(post.description, PREVIEW_CHAR_LIMIT);

  return (
    <Pressable
      onLongPress={onLongPress ? () => onLongPress(post) : undefined}
      delayLongPress={350}>
      <Card style={styles.card} padding={0}>
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {post.title}
          </Text>
          <View style={styles.preview} pointerEvents="none">
            <MarkdownView source={preview} />
          </View>
          <View style={styles.dates}>
            <Text style={[styles.dateText, { color: colors.muted }]}>
              Creado: {formatShortDate(post.createdAt)}
            </Text>
            <Text style={[styles.dateText, { color: colors.muted }]}>
              Editado: {formatShortDate(post.updatedAt)}
            </Text>
          </View>
        </View>
        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
            <Ionicons name="image-outline" size={48} color={colors.muted} />
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md, overflow: 'hidden' },
  body: { padding: Spacing.lg },
  title: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  preview: { marginBottom: Spacing.sm, maxHeight: 90, overflow: 'hidden' },
  dates: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.xs },
  dateText: { fontSize: 12 },
  image: {
    width: '100%',
    height: 160,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  placeholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
});
