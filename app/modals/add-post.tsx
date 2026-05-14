import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { usePosts } from '@/hooks/use-posts';
import { Button } from '@/components/ui/button';
import { ModalScreen } from '@/components/ui/modal-screen';
import { MarkdownToolbar, type Selection } from '@/components/posts/markdown-toolbar';
import { MarkdownView } from '@/components/posts/markdown-view';
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
  const [description, setDescription] = useState(editing?.description ?? '');
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [imageUri, setImageUri] = useState<string | undefined>(editing?.imageUri);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permiso requerido',
        'Concede acceso a tu galería para elegir una imagen.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Concede acceso a la cámara para tomar una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const promptImageSource = () => {
    Alert.alert('Agregar imagen', '¿De dónde quieres tomarla?', [
      { text: 'Cámara', onPress: takePhoto },
      { text: 'Galería', onPress: pickFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe un título para el post.');
      return;
    }
    if (isEdit && editing) {
      editPost(editing.id, { title: title.trim(), description, imageUri });
    } else {
      addPost({ title: title.trim(), description, imageUri });
    }
    if (router.canGoBack()) router.back();
  };

  const handleExport = () => {
    const draft = { title: title.trim() || 'Sin título', description };
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
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.text }]}>Título</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="¿De qué trata este post?"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          autoFocus={!isEdit}
        />

        <Text style={[styles.label, { color: colors.text }]}>Imagen</Text>
        {imageUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
            <View style={styles.imageActions}>
              <Pressable
                onPress={promptImageSource}
                style={[styles.imageActionBtn, { backgroundColor: colors.surface }]}>
                <Ionicons name="swap-horizontal" size={18} color={colors.text} />
                <Text style={[styles.imageActionLabel, { color: colors.text }]}>Cambiar</Text>
              </Pressable>
              <Pressable
                onPress={() => setImageUri(undefined)}
                style={[styles.imageActionBtn, { backgroundColor: colors.surface }]}>
                <Ionicons name="trash-outline" size={18} color={colors.text} />
                <Text style={[styles.imageActionLabel, { color: colors.text }]}>Quitar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={promptImageSource}
            style={[
              styles.addImage,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}>
            <Ionicons name="image-outline" size={28} color={colors.muted} />
            <Text style={[styles.addImageLabel, { color: colors.muted }]}>
              Agregar imagen (cámara o galería)
            </Text>
          </Pressable>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Contenido (Markdown)</Text>
        <View style={[styles.editorWrap, { borderColor: colors.border }]}>
          <MarkdownToolbar
            value={description}
            selection={selection}
            onChange={({ value, selection: nextSel }) => {
              setDescription(value);
              setSelection(nextSel);
            }}
          />
          <View style={[styles.toolbarDivider, { backgroundColor: colors.border }]} />
          <TextInput
            value={description}
            onChangeText={setDescription}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            selection={selection}
            placeholder={'Escribe aquí. Usa los botones de arriba para dar formato.\n\nPor ejemplo: # Mi título'}
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            style={[styles.editorInput, { color: colors.text }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Vista previa</Text>
        <View
          style={[
            styles.preview,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          {description.trim() ? (
            <MarkdownView source={description} />
          ) : (
            <Text style={{ color: colors.muted, fontStyle: 'italic' }}>
              (sin contenido aún)
            </Text>
          )}
        </View>
      </ScrollView>

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
  body: { paddingBottom: Spacing.lg, gap: Spacing.sm },
  label: { fontSize: 14, fontWeight: '600', marginTop: Spacing.sm },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  addImage: {
    height: 100,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  addImageLabel: { fontSize: 13 },
  imagePreviewWrap: { gap: Spacing.sm },
  imagePreview: { width: '100%', height: 180, borderRadius: Radius.md },
  imageActions: { flexDirection: 'row', gap: Spacing.sm },
  imageActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  imageActionLabel: { fontSize: 14, fontWeight: '600' },
  editorWrap: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toolbarDivider: { height: StyleSheet.hairlineWidth },
  editorInput: {
    minHeight: 180,
    padding: Spacing.md,
    fontSize: 15,
    lineHeight: 22,
  },
  preview: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  exportButton: { paddingHorizontal: Spacing.md },
});
