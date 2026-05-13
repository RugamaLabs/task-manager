import { Text } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { ModalScreen } from '@/components/ui/modal-screen';

/** Modal de crear/editar tarea. El formulario se implementa en la Fase 3. */
export default function AddTaskModal() {
  const colors = useColors();
  return (
    <ModalScreen title="Nueva tarea">
      <Text style={{ color: colors.muted }}>Formulario de tarea — próximamente (Fase 3).</Text>
    </ModalScreen>
  );
}
