import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { pickImageFromUser } from '@/lib/image-picker';
import { makeBlock, type Block, type BlockType } from '@/lib/blocks';

type Props = {
  visible: boolean;
  /** Altura del panel — se hace coincidir con la altura del teclado. */
  height: number;
  onClose: () => void;
  onPick: (block: Block) => void;
};

type Option = {
  type: BlockType;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const OPTIONS: Option[] = [
  { type: 'text', label: 'Texto', icon: 'text-outline' },
  { type: 'h1', label: 'Encabezado 1', icon: 'reader-outline' },
  { type: 'h2', label: 'Encabezado 2', icon: 'reader-outline' },
  { type: 'h3', label: 'Encabezado 3', icon: 'reader-outline' },
  { type: 'bullet', label: 'Lista con viñetas', icon: 'list-outline' },
  { type: 'image', label: 'Imagen', icon: 'image-outline' },
];

/**
 * Panel "Bloques básicos" que reemplaza el teclado.
 * Se ancla abajo con la altura que recibe (idealmente, la del teclado).
 * Tocar el área superior (fuera del panel) lo cierra.
 */
export function BlockTypeMenu({ visible, height, onClose, onPick }: Props) {
  const colors = useColors();

  const handleSelect = async (type: BlockType) => {
    if (type === 'image') {
      const uri = await pickImageFromUser();
      if (uri) onPick(makeBlock('image', { imageUri: uri }));
      else onClose();
      return;
    }
    onPick(makeBlock(type));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              height,
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}>
          <Text style={[styles.title, { color: colors.muted }]}>Bloques básicos</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {OPTIONS.map((opt) => (
              <Pressable
                key={opt.type}
                onPress={() => handleSelect(opt.type)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && { backgroundColor: colors.surface },
                ]}>
                <View style={[styles.optionIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name={opt.icon} size={20} color={colors.text} />
                </View>
                <Text style={[styles.optionLabel, { color: colors.text }]} numberOfLines={1}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'transparent' },
  sheet: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  option: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
});
