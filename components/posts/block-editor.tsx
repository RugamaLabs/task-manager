import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { IconButton } from '@/components/ui/icon-button';
import { BlockAddFab } from '@/components/posts/block-add-fab';
import { BlockTypeMenu } from '@/components/posts/block-type-menu';
import type { Block, BlockType } from '@/lib/blocks';
import { pickImageFromUser } from '@/lib/image-picker';

type Props = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
};

const TYPE_LABELS: Record<BlockType, string> = {
  text: 'Texto',
  h1: 'Encabezado 1',
  h2: 'Encabezado 2',
  h3: 'Encabezado 3',
  bullet: 'Lista',
  image: 'Imagen',
  location: 'Ubicación',
};

const PLACEHOLDERS: Record<BlockType, string> = {
  text: 'Empieza a escribir…',
  h1: 'Encabezado 1',
  h2: 'Encabezado 2',
  h3: 'Encabezado 3',
  bullet: 'Lista',
  image: '',
  location: '',
};

function styleFor(type: BlockType): TextStyle {
  switch (type) {
    case 'h1':
      return { fontSize: 28, fontWeight: '800', lineHeight: 34 };
    case 'h2':
      return { fontSize: 22, fontWeight: '700', lineHeight: 28 };
    case 'h3':
      return { fontSize: 18, fontWeight: '700', lineHeight: 24 };
    case 'bullet':
    case 'text':
    default:
      return { fontSize: 16, lineHeight: 22 };
  }
}

const FALLBACK_KEYBOARD_HEIGHT = 290;
const FAB_LEFT_GUTTER = 36;

/**
 * Editor estilo Notion. El botón "+" sigue al bloque enfocado; al tocarlo,
 * el teclado se oculta y el menú "Bloques básicos" se desliza desde abajo
 * ocupando exactamente la altura del teclado. El nuevo bloque se inserta
 * después del bloque enfocado y recibe el foco automáticamente.
 */
export function BlockEditor({ blocks, onChange }: Props) {
  const colors = useColors();
  const refs = useRef<Map<string, TextInput | null>>(new Map());
  const yMap = useRef<Map<string, number>>(new Map());

  const [focusedId, setFocusedId] = useState<string | null>(blocks[0]?.id ?? null);
  const [fabY, setFabY] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(FALLBACK_KEYBOARD_HEIGHT);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  // Capturar la altura del teclado para que el menú la replique.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    return () => sub.remove();
  }, []);

  // Foco automático en el bloque recién insertado.
  useEffect(() => {
    if (!pendingFocusId) return;
    const handle = setTimeout(() => {
      refs.current.get(pendingFocusId)?.focus();
      setPendingFocusId(null);
    }, 80);
    return () => clearTimeout(handle);
  }, [pendingFocusId]);

  const onLayoutBlock = (id: string, y: number) => {
    yMap.current.set(id, y);
    if (focusedId === id) setFabY(y);
  };

  const handleFocus = (id: string) => {
    setFocusedId(id);
    const y = yMap.current.get(id);
    if (y !== undefined) setFabY(y);
  };

  const updateBlock = useCallback(
    (id: string, patch: Partial<Block>) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    },
    [blocks, onChange],
  );

  const removeBlock = useCallback(
    (id: string) => {
      onChange(blocks.filter((b) => b.id !== id));
      if (focusedId === id) setFocusedId(null);
      yMap.current.delete(id);
    },
    [blocks, onChange, focusedId],
  );

  const insertAfterFocused = useCallback(
    (block: Block) => {
      const afterId = focusedId;
      let nextBlocks: Block[];
      if (!afterId) {
        nextBlocks = [...blocks, block];
      } else {
        const idx = blocks.findIndex((b) => b.id === afterId);
        if (idx < 0) nextBlocks = [...blocks, block];
        else nextBlocks = [...blocks.slice(0, idx + 1), block, ...blocks.slice(idx + 1)];
      }
      onChange(nextBlocks);
      if (block.type !== 'image') {
        setFocusedId(block.id);
        setPendingFocusId(block.id);
      }
    },
    [blocks, focusedId, onChange],
  );

  const replaceImage = useCallback(
    async (id: string) => {
      const uri = await pickImageFromUser();
      if (uri) updateBlock(id, { imageUri: uri });
    },
    [updateBlock],
  );

  const openMenu = () => {
    Keyboard.dismiss();
    // Pequeña pausa para que el teclado empiece a bajar antes de subir el menú.
    setTimeout(() => setMenuVisible(true), 120);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    // Si seguimos teniendo un bloque enfocado, devolver el teclado.
    if (focusedId) {
      setTimeout(() => refs.current.get(focusedId)?.focus(), 80);
    }
  };

  const handlePick = (block: Block) => {
    setMenuVisible(false);
    insertAfterFocused(block);
  };

  const openActions = (block: Block) => {
    const otherTypes: BlockType[] = (['text', 'h1', 'h2', 'h3', 'bullet'] as BlockType[]).filter(
      (t) => t !== block.type,
    );
    Alert.alert(
      `Bloque: ${TYPE_LABELS[block.type]}`,
      'Elige una acción',
      [
        ...otherTypes.map((t) => ({
          text: `Convertir a ${TYPE_LABELS[t]}`,
          onPress: () => updateBlock(block.id, { type: t }),
        })),
        {
          text: 'Eliminar',
          style: 'destructive' as const,
          onPress: () => removeBlock(block.id),
        },
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {blocks.map((b) => (
        <View
          key={b.id}
          onLayout={(e) => onLayoutBlock(b.id, e.nativeEvent.layout.y)}>
          {b.type === 'image' ? (
            <ImageBlockRow
              block={b}
              onSelect={() => handleFocus(b.id)}
              onReplace={() => replaceImage(b.id)}
              onRemove={() => removeBlock(b.id)}
            />
          ) : b.type === 'location' ? (
            <LocationBlockRow block={b} onRemove={() => removeBlock(b.id)} />
          ) : (
            <TextBlockRow
              block={b}
              refSetter={(r) => {
                refs.current.set(b.id, r);
              }}
              colors={colors}
              onFocus={() => handleFocus(b.id)}
              onChangeContent={(content) => updateBlock(b.id, { content })}
              onOpenActions={() => openActions(b)}
            />
          )}
        </View>
      ))}

      {focusedId && <BlockAddFab y={fabY} onPress={openMenu} />}

      <BlockTypeMenu
        visible={menuVisible}
        height={keyboardHeight}
        onClose={closeMenu}
        onPick={handlePick}
      />
    </View>
  );
}

type TextRowProps = {
  block: Block;
  refSetter: (ref: TextInput | null) => void;
  colors: ReturnType<typeof useColors>;
  onFocus: () => void;
  onChangeContent: (content: string) => void;
  onOpenActions: () => void;
};

function TextBlockRow({
  block,
  refSetter,
  colors,
  onFocus,
  onChangeContent,
  onOpenActions,
}: TextRowProps) {
  const inner = (
    <TextInput
      ref={refSetter}
      value={block.content ?? ''}
      onChangeText={onChangeContent}
      onFocus={onFocus}
      placeholder={PLACEHOLDERS[block.type]}
      placeholderTextColor={colors.muted}
      multiline
      textAlignVertical="top"
      style={[styleFor(block.type), { color: colors.text, flex: 1, padding: 0 }]}
    />
  );

  return (
    <View style={styles.row}>
      {block.type === 'bullet' && (
        <Text style={[styles.bulletDot, { color: colors.text }]}>•</Text>
      )}
      {inner}
      <IconButton
        name="ellipsis-vertical"
        onPress={onOpenActions}
        accessibilityLabel="Acciones del bloque"
        size={16}
        color={colors.muted}
      />
    </View>
  );
}

function ImageBlockRow({
  block,
  onSelect,
  onReplace,
  onRemove,
}: {
  block: Block;
  onSelect: () => void;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onSelect} style={styles.imageRow}>
      {block.imageUri ? (
        <Image source={{ uri: block.imageUri }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: colors.surface }]} />
      )}
      <View style={styles.imageActions}>
        <Pressable
          onPress={onReplace}
          style={[styles.imageActionBtn, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Cambiar</Text>
        </Pressable>
        <Pressable
          onPress={onRemove}
          style={[styles.imageActionBtn, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Quitar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function LocationBlockRow({ block, onRemove }: { block: Block; onRemove: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.locationChip, { backgroundColor: colors.surface }]}>
      <Ionicons name="location" size={16} color={colors.primary} />
      <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
        {block.location?.name ?? 'Ubicación'}
      </Text>
      <IconButton
        name="close"
        onPress={onRemove}
        accessibilityLabel="Quitar ubicación"
        size={16}
        color={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingLeft: FAB_LEFT_GUTTER,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  bulletDot: { fontSize: 18, lineHeight: 22, marginTop: 1 },
  imageRow: { gap: Spacing.sm, marginVertical: Spacing.xs },
  image: { width: '100%', height: 200, borderRadius: Radius.md },
  imageActions: { flexDirection: 'row', gap: Spacing.sm },
  imageActionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    marginVertical: Spacing.xs,
  },
  locationText: { flex: 1, fontSize: 14, fontWeight: '600' },
});
