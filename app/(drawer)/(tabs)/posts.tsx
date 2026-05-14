import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { usePosts } from '@/hooks/use-posts';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchBar } from '@/components/ui/search-bar';
import { PostCard } from '@/components/posts/post-card';
import {
  copyPostMarkdownToClipboard,
  sharePostAsMarkdown,
  stripMarkdown,
} from '@/lib/markdown';
import type { Post } from '@/lib/types';

export default function PostsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { posts, loading, removePost } = usePosts();

  const [query, setQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const haystack = `${p.title} ${stripMarkdown(p.description)}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  const handleLongPress = (post: Post) => {
    Alert.alert(post.title || 'Post', '¿Qué deseas hacer?', [
      {
        text: 'Editar',
        onPress: () => router.push({ pathname: '/modals/add-post', params: { id: post.id } }),
      },
      {
        text: 'Compartir como .md',
        onPress: () => {
          sharePostAsMarkdown(post).catch((error) => {
            Alert.alert('Error al compartir', String(error?.message ?? error));
          });
        },
      },
      {
        text: 'Copiar al portapapeles',
        onPress: async () => {
          await copyPostMarkdownToClipboard(post);
          Alert.alert('Copiado', 'El markdown del post está en el portapapeles.');
        },
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removePost(post.id),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Posts" onSearchPress={() => setSearchVisible((v) => !v)} />
      {searchVisible && (
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar posts"
            autoFocus
          />
        </View>
      )}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="document-text-outline"
            message="Aún no tienes posts"
            hint="Toca + en la barra inferior para crear uno"
          />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="search-outline"
            message="Sin resultados"
            hint={`Ningún post coincide con "${query}"`}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} onLongPress={handleLongPress} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
});
