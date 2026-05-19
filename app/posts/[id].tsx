import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { usePosts } from '@/hooks/use-posts';
import { IconButton } from '@/components/ui/icon-button';
import { MarkdownView } from '@/components/posts/markdown-view';
import { resolveCoverImageUri } from '@/lib/blocks';
import { formatShortDate } from '@/lib/date';
import {
  copyPostMarkdownToClipboard,
  sharePostAsMarkdown,
} from '@/lib/markdown';

/**
 * Vista de lectura de un post. Header con back + acciones (Editar, Exportar, kebab).
 * Tap en cualquier `PostCard`/`PostListRow`/`PostGalleryItem` lleva aquí.
 */
export default function PostDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPostById, removePost } = usePosts();

  const post = id ? getPostById(id) : undefined;

  // Si el post no existe (p. ej. borrado desde otra pantalla), volver atrás.
  useEffect(() => {
    if (id && !post) {
      if (router.canGoBack()) router.back();
    }
  }, [id, post, router]);

  if (!post) return null;

  const cover = resolveCoverImageUri(post);

  const handleEdit = () => {
    router.push({ pathname: '/modals/add-post', params: { id: post.id } });
  };

  const handleExport = () => {
    sharePostAsMarkdown(post).catch((error) => {
      Alert.alert('Error al compartir', String(error?.message ?? error));
    });
  };

  const handleMore = () => {
    Alert.alert('Más opciones', '¿Qué deseas hacer?', [
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
        onPress: () => {
          removePost(post.id);
          if (router.canGoBack()) router.back();
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.sm,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}>
        <IconButton
          name="arrow-back"
          onPress={() => router.back()}
          accessibilityLabel="Volver"
          color={colors.text}
        />
        <View style={{ flex: 1 }} />
        <IconButton
          name="create-outline"
          onPress={handleEdit}
          accessibilityLabel="Editar"
          color={colors.text}
        />
        <IconButton
          name="share-outline"
          onPress={handleExport}
          accessibilityLabel="Exportar"
          color={colors.text}
        />
        <IconButton
          name="ellipsis-vertical"
          onPress={handleMore}
          accessibilityLabel="Más opciones"
          color={colors.text}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} contentFit="cover" />
        ) : null}
        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
        <Text style={[styles.dates, { color: colors.muted }]}>
          Creado: {formatShortDate(post.createdAt)} · Editado: {formatShortDate(post.updatedAt)}
        </Text>
        <View style={styles.divider} />
        <MarkdownView source={post.description} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  cover: {
    width: '100%',
    height: 220,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
  },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  dates: { fontSize: 13, marginBottom: Spacing.xs },
  divider: { height: Spacing.xs },
});
