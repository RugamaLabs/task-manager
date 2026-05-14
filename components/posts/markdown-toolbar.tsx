import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';

export type Selection = { start: number; end: number };

export type ToolbarChange = {
  value: string;
  selection: Selection;
};

type Props = {
  value: string;
  selection: Selection;
  onChange: (change: ToolbarChange) => void;
};

/* ---------- Lógica de inserción (funciones puras) ---------- */

/** Antepone `prefix` al comienzo de la línea donde está el cursor. */
function prependOnCurrentLine(value: string, sel: Selection, prefix: string): ToolbarChange {
  const lineStart = value.lastIndexOf('\n', sel.start - 1) + 1;
  // Si ya empieza con un prefijo de heading o viñeta, lo reemplazamos para no acumular `### #`.
  const existingPrefixMatch = value.slice(lineStart).match(/^(#{1,3}\s|-\s)/);
  const existingLen = existingPrefixMatch ? existingPrefixMatch[0].length : 0;
  const before = value.slice(0, lineStart);
  const after = value.slice(lineStart + existingLen);
  const next = before + prefix + after;
  const delta = prefix.length - existingLen;
  return {
    value: next,
    selection: {
      start: Math.max(lineStart, sel.start + delta),
      end: Math.max(lineStart, sel.end + delta),
    },
  };
}

/** Envuelve la selección con `before`/`after`; si no hay selección, coloca el cursor en medio. */
function wrapSelection(
  value: string,
  sel: Selection,
  before: string,
  after: string,
): ToolbarChange {
  const selected = value.slice(sel.start, sel.end);
  const insertion = `${before}${selected}${after}`;
  const next = value.slice(0, sel.start) + insertion + value.slice(sel.end);
  if (sel.start === sel.end) {
    const cursor = sel.start + before.length;
    return { value: next, selection: { start: cursor, end: cursor } };
  }
  return {
    value: next,
    selection: { start: sel.start + before.length, end: sel.end + before.length },
  };
}

/** Inserta un bloque de código con backticks triples; cursor dentro del bloque. */
function insertFencedBlock(value: string, sel: Selection): ToolbarChange {
  const selected = value.slice(sel.start, sel.end);
  const leadIsNewline = sel.start === 0 || value[sel.start - 1] === '\n';
  const trailNeedsNewline = sel.end >= value.length || value[sel.end] !== '\n';
  const prefix = leadIsNewline ? '' : '\n';
  const suffix = trailNeedsNewline ? '\n' : '';
  const block = `${prefix}\`\`\`\n${selected || ''}\n\`\`\`${suffix}`;
  const next = value.slice(0, sel.start) + block + value.slice(sel.end);
  const cursorStart = sel.start + prefix.length + 4; // "```\n"
  const cursorEnd = cursorStart + selected.length;
  return { value: next, selection: { start: cursorStart, end: cursorEnd } };
}

/* ---------- Componente ---------- */

type ButtonSpec = {
  key: string;
  label?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  apply: (value: string, sel: Selection) => ToolbarChange;
  accessibilityLabel: string;
};

const BUTTONS: ButtonSpec[] = [
  {
    key: 'h1',
    label: 'H1',
    apply: (v, s) => prependOnCurrentLine(v, s, '# '),
    accessibilityLabel: 'Insertar encabezado 1',
  },
  {
    key: 'h2',
    label: 'H2',
    apply: (v, s) => prependOnCurrentLine(v, s, '## '),
    accessibilityLabel: 'Insertar encabezado 2',
  },
  {
    key: 'h3',
    label: 'H3',
    apply: (v, s) => prependOnCurrentLine(v, s, '### '),
    accessibilityLabel: 'Insertar encabezado 3',
  },
  {
    key: 'bullet',
    icon: 'list',
    apply: (v, s) => prependOnCurrentLine(v, s, '- '),
    accessibilityLabel: 'Insertar viñeta',
  },
  {
    key: 'inline-code',
    label: '`code`',
    apply: (v, s) => wrapSelection(v, s, '`', '`'),
    accessibilityLabel: 'Insertar código inline',
  },
  {
    key: 'fence',
    label: '``` ```',
    apply: insertFencedBlock,
    accessibilityLabel: 'Insertar bloque de código',
  },
];

/** Barra horizontal de botones que insertan sintaxis Markdown en la posición del cursor. */
export function MarkdownToolbar({ value, selection, onChange }: Props) {
  const colors = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {BUTTONS.map((b) => (
        <Pressable
          key={b.key}
          onPress={() => onChange(b.apply(value, selection))}
          accessibilityRole="button"
          accessibilityLabel={b.accessibilityLabel}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}>
          {b.icon ? (
            <Ionicons name={b.icon} size={18} color={colors.text} />
          ) : (
            <Text style={[styles.label, { color: colors.text }]}>{b.label}</Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Exportamos las funciones puras para tests o reuso si hace falta.
export const _internal = { prependOnCurrentLine, wrapSelection, insertFencedBlock };

const styles = StyleSheet.create({
  row: { gap: Spacing.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  button: {
    paddingHorizontal: Spacing.md,
    height: 36,
    minWidth: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.6 },
});
