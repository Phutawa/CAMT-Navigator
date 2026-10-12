/**
 * Web Mercator Georeferencing Helper for Campus Map Raster Overlay
 * Page dimensions: 2151 x 1847 units
 */

export interface BoundingBox {
  north: number;
  south: number;
  west: number;
  east: number;
}

/**
 * Calculates Web Mercator Y coordinate from latitude in degrees
 * mercY(lat) = ln(tan(pi/4 + lat * pi/360))
 */
export function mercatorY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

/**
 * Inverse Web Mercator: calculates latitude from Mercator Y
 */
export function inverseMercatorY(mercY: number): number {
  return ((2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * 180) / Math.PI;
}

/**
 * Converts image pixel coordinates (x: 0..pageWidth, y: 0..pageHeight) to [lat, lng]
 */
export function pixelToLatLng(
  x: number,
  y: number,
  pageWidth: number,
  pageHeight: number,
  bbox: BoundingBox
): [number, number] {
  const fracX = x / pageWidth;
  const fracY = y / pageHeight;

  const lng = bbox.west + fracX * (bbox.east - bbox.west);

  const topMercY = mercatorY(bbox.north);
  const bottomMercY = mercatorY(bbox.south);
  const mercY = topMercY - fracY * (topMercY - bottomMercY);
  const lat = inverseMercatorY(mercY);

  return [lat, lng];
}

/**
 * Converts [lat, lng] to image pixel coordinates (x, y)
 */
export function latLngToPixel(
  lat: number,
  lng: number,
  pageWidth: number,
  pageHeight: number,
  bbox: BoundingBox
): [number, number] {
  const fracX = (lng - bbox.west) / (bbox.east - bbox.west);

  const topMercY = mercatorY(bbox.north);
  const bottomMercY = mercatorY(bbox.south);
  const targetMercY = mercatorY(lat);
  const fracY = (topMercY - targetMercY) / (topMercY - bottomMercY);

  return [fracX * pageWidth, fracY * pageHeight];
}
