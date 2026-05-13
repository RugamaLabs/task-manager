import { Text } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { ModalScreen } from '@/components/ui/modal-screen';

/** Modal de crear hábito. El formulario se implementa en la Fase 4. */
export default function AddHabitModal() {
  const colors = useColors();
  return (
    <ModalScreen title="Nuevo hábito">
      <Text style={{ color: colors.muted }}>Formulario de hábito — próximamente (Fase 4).</Text>
    </ModalScreen>
  );
}
