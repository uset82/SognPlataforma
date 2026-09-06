import { useEffect, useRef } from 'react';
import type { LayerSpecification } from 'maplibre-gl';
import { useMap } from '../MapCanvas';

type LayerBody = Omit<LayerSpecification, 'id' | 'source'> & { id?: string };

/**
 * Declarative GeoJSON source + layers.
 *
 * Adding and removing is idempotent: the source is created once, then only its
 * data is swapped on update. That matters because the scenario ticks every
 * second — recreating sources would make the geometry flicker.
 */
export function GeoJsonLayer({
  id,
  data,
  layers,
  visible = true,
}: {
  id: string;
  data: unknown;
  layers: LayerBody[];
  visible?: boolean;
}) {
  const { map, ready } = useMap();
  const mounted = useRef(false);

  // Create source + layers once the style is live.
  useEffect(() => {
    if (!map || !ready) return undefined;

    if (!map.getSource(id)) {
      map.addSource(id, { type: 'geojson', data: data as never });
    }

    const layerIds: string[] = [];
    layers.forEach((body, i) => {
      const layerId = body.id ?? `${id}-${i}`;
      layerIds.push(layerId);
      if (!map.getLayer(layerId)) {
        map.addLayer({ ...(body as object), id: layerId, source: id } as LayerSpecification);
      }
    });
    mounted.current = true;

    return () => {
      layerIds.forEach((lid) => {
        if (map.getLayer(lid)) map.removeLayer(lid);
      });
      if (map.getSource(id)) map.removeSource(id);
      mounted.current = false;
    };
    // Layer specs are static per mount; only `data` and `visible` are live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, id]);

  // Swap data in place on every scenario tick.
  useEffect(() => {
    if (!map || !ready || !mounted.current) return;
    const src = map.getSource(id);
    if (src && 'setData' in src) (src as { setData: (d: unknown) => void }).setData(data);
  }, [map, ready, id, data]);

  // Visibility toggling for the map-layer switcher.
  useEffect(() => {
    if (!map || !ready || !mounted.current) return;
    layers.forEach((body, i) => {
      const layerId = body.id ?? `${id}-${i}`;
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, id, visible]);

  return null;
}
