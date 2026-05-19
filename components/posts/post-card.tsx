import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { Card } from '@/components/ui/card';
import { resolveCoverImageUri } from '@/lib/blocks';
import { formatTimeOfDay } from '@/lib/date';
import { stripMarkdown } from '@/lib/markdown';
import type { Post } from '@/lib/types';

const PREVIEW_LIMIT = 140;
const THUMB = 96;

type Props = {
  post: Post;
  onPress?: (post: Post) => void;
  onLongPress?: (post: Post) => void;
};

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  const slice = s.slice(0, n);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + '…';
}

/**
 * Card horizontal del modo "Tarjeta": hora arriba, título bold, preview en texto
 * plano y thumbnail cuadrado de la portada a la derecha (si existe).
 */
export function PostCard({ post, onPress, onLongPress }: Props) {
  const colors = useColors();
  const cover = resolveCoverImageUri(post);
  const preview = truncate(stripMarkdown(post.description), PREVIEW_LIMIT);

  return (
    <Pressable
      onPress={onPress ? () => onPress(post) : undefined}
      onLongPress={onLongPress ? () => onLongPress(post) : undefined}
      delayLongPress={350}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.body}>
            <Text style={[styles.time, { color: colors.text }]}>
              {formatTimeOfDay(post.createdAt)}
            </Text>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {post.title}
            </Text>
            {preview ? (
              <Text style={[styles.preview, { color: colors.muted }]} numberOfLines={2}>
                {preview}
              </Text>
            ) : null}
          </View>
          {cover ? (
            <Image source={{ uri: cover }} style={styles.thumb} contentFit="cover" />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  body: { flex: 1, gap: Spacing.xs },
  time: { fontSize: 14, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', marginTop: Spacing.xs },
  preview: { fontSize: 14, lineHeight: 20 },
  thumb: { width: THUMB, height: THUMB, borderRadius: Radius.md },
  pressed: { opacity: 0.7 },
});
