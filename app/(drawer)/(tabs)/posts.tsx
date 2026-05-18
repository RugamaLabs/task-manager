import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { usePosts } from '@/hooks/use-posts';
import { useSettings } from '@/hooks/use-settings';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchBar } from '@/components/ui/search-bar';
import { PostCard } from '@/components/posts/post-card';
import { PostGalleryItem } from '@/components/posts/post-gallery-item';
import { PostListRow } from '@/components/posts/post-list-row';
import {
  copyPostMarkdownToClipboard,
  sharePostAsMarkdown,
  stripMarkdown,
} from '@/lib/markdown';
import type { Post, PostViewMode } from '@/lib/types';

const MODE_OPTIONS: { mode: PostViewMode; icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { mode: 'list', icon: 'list-outline', label: 'Lista' },
  { mode: 'card', icon: 'newspaper-outline', label: 'Tarjeta' },
  { mode: 'gallery', icon: 'grid-outline', label: 'Galería' },
];

export default function PostsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { posts, loading, removePost } = usePosts();
  const { settings, setPostViewMode } = useSettings();

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

  const renderBody = () => {
    if (settings.postViewMode === 'list') {
      return (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {filtered.map((p) => (
            <PostListRow key={p.id} post={p} onLongPress={handleLongPress} />
          ))}
        </ScrollView>
      );
    }
    if (settings.postViewMode === 'gallery') {
      return (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <View style={styles.galleryGrid}>
            {filtered.map((p) => (
              <View key={p.id} style={styles.galleryCell}>
                <PostGalleryItem post={p} onLongPress={handleLongPress} />
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }
    // Card (default)
    return (
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {filtered.map((p) => (
          <PostCard key={p.id} post={p} onLongPress={handleLongPress} />
        ))}
      </ScrollView>
    );
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

      <View style={styles.modeBarWrap}>
        <View style={[styles.modeBar, { backgroundColor: colors.surface }]}>
          {MODE_OPTIONS.map((opt) => {
            const active = settings.postViewMode === opt.mode;
            return (
              <Pressable
                key={opt.mode}
                onPress={() => setPostViewMode(opt.mode)}
                accessibilityRole="button"
                accessibilityLabel={`Vista ${opt.label}`}
                accessibilityState={{ selected: active }}
                style={[
                  styles.modeOption,
                  active && { backgroundColor: colors.card },
                ]}>
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={active ? colors.primary : colors.muted}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

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
        renderBody()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  modeBarWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  modeBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
    gap: 4,
  },
  modeOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  galleryCell: { width: '47%' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
});
