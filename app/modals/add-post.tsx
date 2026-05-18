import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { usePosts } from '@/hooks/use-posts';
import { Button } from '@/components/ui/button';
import { ModalScreen } from '@/components/ui/modal-screen';
import { BlockEditor } from '@/components/posts/block-editor';
import { CoverPicker } from '@/components/posts/cover-picker';
import {
  imageUrisFromBlocks,
  makeBlock,
  parseMarkdownToBlocks,
  serializeBlocksToMarkdown,
  type Block,
} from '@/lib/blocks';
import {
  copyPostMarkdownToClipboard,
  sharePostAsMarkdown,
} from '@/lib/markdown';

export default function AddPostModal() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addPost, editPost, getPostById } = usePosts();

  const editing = useMemo(() => (id ? getPostById(id) : undefined), [id, getPostById]);
  const isEdit = Boolean(editing);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [blocks, setBlocks] = useState<Block[]>(() =>
    editing ? parseMarkdownToBlocks(editing.description) : [makeBlock('text')],
  );
  const [coverImageUri, setCoverImageUri] = useState<string | undefined>(editing?.coverImageUri);

  const imageUris = useMemo(() => imageUrisFromBlocks(blocks), [blocks]);

  // Si la imagen seleccionada deja de existir en el cuerpo, limpiar la selección.
  useMemo(() => {
    if (coverImageUri && !imageUris.includes(coverImageUri)) {
      setCoverImageUri(undefined);
    }
  }, [coverImageUri, imageUris]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe un título para el post.');
      return;
    }
    const description = serializeBlocksToMarkdown(blocks);
    const cover = coverImageUri ?? imageUris[0];
    if (isEdit && editing) {
      editPost(editing.id, { title: title.trim(), description, coverImageUri: cover });
    } else {
      addPost({ title: title.trim(), description, coverImageUri: cover });
    }
    if (router.canGoBack()) router.back();
  };

  const handleExport = () => {
    const draft = {
      title: title.trim() || 'Sin título',
      description: serializeBlocksToMarkdown(blocks),
    };
    Alert.alert('Exportar post', '¿Cómo quieres exportarlo?', [
      {
        text: 'Compartir como .md',
        onPress: () => {
          sharePostAsMarkdown(draft).catch((error) => {
            Alert.alert('Error al compartir', String(error?.message ?? error));
          });
        },
      },
      {
        text: 'Copiar al portapapeles',
        onPress: async () => {
          await copyPostMarkdownToClipboard(draft);
          Alert.alert('Copiado', 'El markdown del post está en el portapapeles.');
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <ModalScreen title={isEdit ? 'Editar post' : 'Nuevo post'}>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={20}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Título"
          placeholderTextColor={colors.muted}
          style={[styles.titleInput, { color: colors.text }]}
          autoFocus={!isEdit}
        />

        <View style={styles.coverSection}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>Portada</Text>
          <CoverPicker
            imageUris={imageUris}
            selectedUri={coverImageUri}
            onChange={setCoverImageUri}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        {isEdit && (
          <Button
            label="Exportar"
            variant="secondary"
            onPress={handleExport}
            style={styles.exportButton}
          />
        )}
        <Button
          label={isEdit ? 'Guardar cambios' : 'Crear post'}
          onPress={handleSave}
          style={{ flex: 1 }}
        />
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingBottom: Spacing.lg, gap: Spacing.sm },
  titleInput: {
    fontSize: 28,
    fontWeight: '800',
    paddingVertical: Spacing.sm,
  },
  coverSection: { gap: Spacing.xs },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: { height: 1, marginVertical: Spacing.sm, borderRadius: Radius.sm },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  exportButton: { paddingHorizontal: Spacing.md },
});
