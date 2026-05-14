/**
 * Pantalla "fantasma" requerida por el router para que exista la pestaña "Add".
 * Nunca se monta: el `tabPress` de esta pestaña hace `preventDefault()` y abre un modal
 * (ver `app/(drawer)/(tabs)/_layout.tsx`).
 */
export default function AddTabPlaceholder() {
  return null;
}
