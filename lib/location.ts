/**
 * Captura de ubicación con `expo-location`: pide permiso, lee el GPS actual y
 * hace reverse-geocoding para componer un nombre legible del lugar.
 */
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export type Place = {
  name: string;
  latitude: number;
  longitude: number;
};

/** Compone "calle, distrito/ciudad, región, país" quitando vacíos y duplicados consecutivos. */
function composeFullName(addr: Location.LocationGeocodedAddress): string {
  const parts = [
    addr.street ?? addr.name ?? undefined,
    addr.district ?? addr.subregion ?? addr.city ?? undefined,
    addr.region ?? undefined,
    addr.country ?? undefined,
  ];
  const result: string[] = [];
  for (const part of parts) {
    const value = part?.trim();
    if (value && result[result.length - 1] !== value) {
      result.push(value);
    }
  }
  return result.join(', ');
}

/**
 * Pide permiso, obtiene la ubicación actual y devuelve `{ name, latitude, longitude }`.
 * Devuelve `null` (y muestra un Alert) si se deniega el permiso o falla el GPS.
 */
export async function capturePlace(): Promise<Place | null> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permiso requerido', 'Concede acceso a la ubicación para añadir el lugar.');
    return null;
  }

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;
    let name = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      const composed = results.length > 0 ? composeFullName(results[0]) : '';
      if (composed) name = composed;
    } catch {
      // Sin reverse-geocoding: dejamos las coordenadas como nombre.
    }
    return { name, latitude, longitude };
  } catch {
    Alert.alert('Ubicación no disponible', 'No se pudo obtener tu ubicación actual.');
    return null;
  }
}
