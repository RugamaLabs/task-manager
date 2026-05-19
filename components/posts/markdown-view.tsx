import { useMemo } from 'react';
import { Platform, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { MarkdownImage } from '@/components/posts/markdown-image';

/**
 * markdown-it por defecto rechaza URIs `file:`, `javascript:`, `vbscript:` y `data:`
 * (excepto `data:image/...`) en `validateLink`. Eso impide que `![](file:///…)` se
 * parsee como nodo de imagen: queda como texto crudo. Inyectamos una instancia
 * propia con `validateLink = () => true` para permitir las URIs locales de
 * `expo-image-picker`. Es seguro porque las URIs vienen del propio dispositivo,
 * nunca de input externo.
 */
const markdownItInstance = MarkdownIt({ typographer: true });
markdownItInstance.validateLink = () => true;

type Props = {
  /** Texto markdown a renderizar. */
  source: string;
  /** Estilos adicionales del contenedor raíz. */
  style?: StyleProp<ViewStyle>;
};

const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/**
 * Renderiza markdown con estilos derivados del theme actual (claro/oscuro).
 * Cubre el alcance del MVP: h1/h2/h3, párrafos, listas no ordenadas, código inline y bloques.
 */
export function MarkdownView({ source, style }: Props) {
  const colors = useColors();

  const markdownStyles = useMemo(
    () => ({
      body: { color: colors.text, fontSize: 15, lineHeight: 22 } as TextStyle,
      heading1: {
        color: colors.text,
        fontSize: 24,
        fontWeight: '800',
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
      } as TextStyle,
      heading2: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
      } as TextStyle,
      heading3: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '700',
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
      } as TextStyle,
      paragraph: { marginVertical: Spacing.xs } as ViewStyle,
      bullet_list: { marginVertical: Spacing.xs } as ViewStyle,
      list_item: { marginVertical: 2 } as ViewStyle,
      code_inline: {
        backgroundColor: colors.surface,
        color: colors.text,
        fontFamily: MONO,
        fontSize: 13,
        paddingHorizontal: Spacing.xs,
        borderRadius: Radius.sm,
      } as TextStyle,
      fence: {
        backgroundColor: colors.surface,
        color: colors.text,
        fontFamily: MONO,
        fontSize: 13,
        padding: Spacing.md,
        borderRadius: Radius.md,
        marginVertical: Spacing.sm,
        borderWidth: 0,
      } as TextStyle,
      code_block: {
        backgroundColor: colors.surface,
        color: colors.text,
        fontFamily: MONO,
        fontSize: 13,
        padding: Spacing.md,
        borderRadius: Radius.md,
      } as TextStyle,
    }),
    [colors],
  );

  return (
    <Markdown
      markdownit={markdownItInstance}
      style={markdownStyles}
      rules={{
        image: (node) => (
          <MarkdownImage key={node.key} uri={node.attributes.src as string} />
        ),
      }}
      mergeStyle>
      {source}
    </Markdown>
  );
}
