// Pantalla de carga del portal: aparece al instante mientras el servidor arma
// el Home (20 lecturas). Sin esto, en un arranque frío después de un deploy
// la persona veía la pantalla en blanco hasta 30 s y pensaba que se rompió.
import { BrandSplash } from '@/components/shared/BrandSplash';
export default function Loading() {
  return <BrandSplash />;
}
