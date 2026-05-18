import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

type Props = {
  /** Todas las URIs de imágenes embebidas en el cuerpo, en orden. */
  imageUris: string[];
  /** URI marcada como portada. `undefined` = "Sin portada". */
  selectedUri?: string;
  onChange: (uri: string | undefined) => void;
};

/**
 * Tira horizontal con miniaturas de cada imagen del cuerpo + opción "Sin portada".
 * Si no hay imágenes embebidas, muestra una nota gris.
 */
export function CoverPicker({ imageUris, selectedUri, onChange }: Props) {
  const colors = useColors();

  if (imageUris.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Ionicons name="image-outline" size={20} color={colors.muted} />
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          Adjunta imágenes al cuerpo para elegir una portada.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      <Thumbnail
        label="Sin portada"
        selected={!selectedUri}
        onPress={() => onChange(undefined)}
      />
      {imageUris.map((uri, idx) => (
        <ImageThumbnail
          key={`${uri}-${idx}`}
          uri={uri}
          selected={uri === selectedUri}
          onPress={() => onChange(uri)}
        />
      ))}
    </ScrollView>
  );
}

function ImageThumbnail({
  uri,
  selected,
  onPress,
}: {
  uri: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={styles.itemWrap}>
      <View
        style={[
          styles.thumbBorder,
          { borderColor: selected ? colors.primary : 'transparent' },
        ]}>
        <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
      </View>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

function Thumbnail({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={styles.itemWrap}>
      <View
        style={[
          styles.thumbBorder,
          { borderColor: selected ? colors.primary : 'transparent' },
        ]}>
        <View
          style={[
            styles.thumb,
            styles.noneTile,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Ionicons name="close" size={20} color={colors.muted} />
          <Text style={[styles.noneLabel, { color: colors.muted }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const THUMB = 72;

const styles = StyleSheet.create({
  row: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  itemWrap: { position: 'relative' },
  thumbBorder: { padding: 2, borderRadius: Radius.md, borderWidth: 2 },
  thumb: { width: THUMB, height: THUMB, borderRadius: Radius.sm },
  noneTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 4,
  },
  noneLabel: { fontSize: 10, fontWeight: '600' },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  emptyText: { flex: 1, fontSize: 13 },
});
