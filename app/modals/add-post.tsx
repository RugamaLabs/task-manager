import { Text } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { ModalScreen } from '@/components/ui/modal-screen';

/** Modal de crear/editar post. El formulario (con selector de imagen) se implementa en la Fase 5. */
export default function AddPostModal() {
  const colors = useColors();
  return (
    <ModalScreen title="Nuevo post">
      <Text style={{ color: colors.muted }}>Formulario de post — próximamente (Fase 5).</Text>
    </ModalScreen>
  );
}
