/**
 * Pequeño wrapper sobre `expo-image-picker`: presenta el ActionSheet
 * "Cámara / Galería" y devuelve la URI elegida (o `null` si se canceló).
 *
 * Encapsular este flujo aquí evita duplicarlo entre el modal de Post y el menú
 * de bloques del editor (Fase 7).
 */
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/** Pide permiso y abre el selector de imagen del usuario. Devuelve la URI o `null`. */
export async function pickImageFromUser(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert('Agregar imagen', '¿De dónde quieres tomarla?', [
      {
        text: 'Cámara',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permiso requerido', 'Concede acceso a la cámara para tomar una foto.');
            resolve(null);
            return;
          }
          const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
          resolve(result.canceled ? null : result.assets[0].uri);
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permiso requerido', 'Concede acceso a tu galería para elegir una imagen.');
            resolve(null);
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
          resolve(result.canceled ? null : result.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}
