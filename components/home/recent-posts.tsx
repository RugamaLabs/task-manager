import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { usePosts } from '@/hooks/use-posts';

/** Dos tarjetas grises horizontales con los posts más recientes (por `updatedAt`). */
export function RecentPosts() {
  const colors = useColors();
  const router = useRouter();
  const { posts } = usePosts();

  const recent = [...posts]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 2);

  if (recent.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.muted }}>Aún no hay posts.</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {recent.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => router.push({ pathname: '/modals/add-post', params: { id: p.id } })}
          style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
            {p.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  card: {
    flex: 1,
    height: 110,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  empty: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});
