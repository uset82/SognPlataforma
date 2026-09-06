import type { StyleSpecification } from 'maplibre-gl';

/* ============================================================================
   BASEMAPS — verified available September 2026.

   Norge i bilder closed its open WMTS (access is now restricted to Norge
   digitalt partners), so the aerial layer comes from Esri. Kartverket's topo
   and nautical caches remain free and open with no API key.

   All four sources are declared up front and switched by toggling LAYER
   VISIBILITY rather than calling setStyle(). setStyle would tear down every
   incident layer we add on top; visibility toggling keeps them intact and
   makes basemap switching instant.
   ============================================================================ */

export type BasemapId = 'aerial' | 'topo' | 'grayscale' | 'nautical';

interface BasemapDef {
  id: BasemapId;
  label: string;
  /** Shown in the layer switcher so the operator knows the provenance. */
  provenance: string;
  tiles: string[];
  attribution: string;
  maxzoom: number;
}

const KARTVERKET = (layer: string) =>
  `https://cache.kartverket.no/v1/wmts/1.0.0/${layer}/default/webmercator/{z}/{y}/{x}.png`;

export const BASEMAPS: BasemapDef[] = [
  {
    id: 'aerial',
    label: 'Aerial',
    provenance: 'Esri World Imagery',
    // NOTE: Esri serves this endpoint in {z}/{y}/{x} order, not {z}/{x}/{y}.
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
    maxzoom: 19,
  },
  {
    id: 'topo',
    label: 'Topographic',
    provenance: 'Kartverket topo',
    tiles: [KARTVERKET('topo')],
    attribution: '&copy; Kartverket',
    maxzoom: 18,
  },
  {
    id: 'grayscale',
    label: 'Grayscale',
    provenance: 'Kartverket gr\u00e5tone',
    tiles: [KARTVERKET('topograatone')],
    attribution: '&copy; Kartverket',
    maxzoom: 18,
  },
  {
    id: 'nautical',
    label: 'Nautical chart',
    provenance: 'Kartverket sj\u00f8kart',
    tiles: [KARTVERKET('sjokartraster')],
    attribution: '&copy; Kartverket',
    maxzoom: 18,
  },
];

export const basemapLayerId = (id: BasemapId) => `basemap-${id}`;

/**
 * Base style. Contains only basemaps — every incident layer is added on top
 * at runtime by incidentLayers.ts.
 *
 * No `glyphs` is declared because the product uses zero symbol layers: all map
 * labels are HTML markers, which gives us the callout styling the mockups show
 * and removes a font-server dependency.
 */
export const buildBaseStyle = (active: BasemapId): StyleSpecification => ({
  version: 8,
  sources: Object.fromEntries(
    BASEMAPS.map((b) => [
      b.id,
      {
        type: 'raster' as const,
        tiles: b.tiles,
        tileSize: 256,
        maxzoom: b.maxzoom,
        attribution: b.attribution,
      },
    ])
  ),
  layers: [
    // Ground beneath the tiles: matches --ground-0 so loading reads as intentional.
    { id: 'ground', type: 'background', paint: { 'background-color': '#0A0C0D' } },
    ...BASEMAPS.map((b) => ({
      id: basemapLayerId(b.id),
      type: 'raster' as const,
      source: b.id,
      layout: { visibility: (b.id === active ? 'visible' : 'none') as 'visible' | 'none' },
      paint: {
        'raster-fade-duration': 240,
        // Aerial is dimmed and slightly desaturated so red/amber incident
        // geometry stays the brightest thing on screen (LAW 2).
        'raster-brightness-max': b.id === 'aerial' ? 0.82 : 1,
        'raster-saturation': b.id === 'aerial' ? -0.22 : 0,
      },
    })),
  ],
});
