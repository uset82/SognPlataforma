import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Map as MapLibreMap, Marker, NavigationControl, ScaleControl } from 'maplibre-gl';
import type { LngLatBoundsLike, LngLatLike, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { BASEMAPS, basemapLayerId, buildBaseStyle, type BasemapId } from './basemaps';
import s from './MapCanvas.module.css';

/* ============================================================================
   MapCanvas — a hand-written MapLibre wrapper.

   Deliberately not react-map-gl: MapLibre 6 is ESM-only with named exports,
   and owning the instance directly keeps full control over layer ordering,
   which matters because incident geometry must always sit above the basemap
   and below the HTML markers.
   ============================================================================ */

interface MapCtx {
  map: MapLibreMap | null;
  ready: boolean;
}
const MapContext = createContext<MapCtx>({ map: null, ready: false });
export const useMap = () => useContext(MapContext);

export interface MapCanvasProps {
  center: LngLatLike;
  zoom?: number;
  bearing?: number;
  pitch?: number;
  basemap?: BasemapId;
  /** Recentres with an eased fly when this key changes. */
  flyKey?: string | number;
  fitBounds?: LngLatBoundsLike;
  interactive?: boolean;
  /** Floating glass overlays. LAW 3 permits glass only here. */
  children?: React.ReactNode;
  className?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  center,
  zoom = 13.4,
  bearing = 0,
  pitch = 0,
  basemap = 'aerial',
  flyKey,
  fitBounds,
  interactive = true,
  children,
  className,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const teardownRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  /* -- Create once -------------------------------------------------------
     MapLibre does not survive React StrictMode's mount -> unmount -> mount
     cycle: destroying an instance while a second one is initialising tears
     down the shared worker pool and leaves the new map with a dead render
     loop (no load, no idle, no render events, forever).

     So teardown is deferred by a tick. StrictMode's immediate remount cancels
     it and reuses the live instance; a genuine unmount lets it run.          */
  useLayoutEffect(() => {
    if (!hostRef.current) return undefined;

    if (teardownRef.current !== null) {
      clearTimeout(teardownRef.current);
      teardownRef.current = null;
    }

    let map = mapRef.current;
    if (!map) {
      map = new MapLibreMap({
        container: hostRef.current,
        style: buildBaseStyle(basemap) as StyleSpecification,
        center,
        zoom,
        bearing,
        pitch,
        interactive,
        attributionControl: { compact: true },
        // The console owns keyboard focus; the map should not steal arrow keys.
        keyboard: false,
      });

      map.addControl(new NavigationControl({ showCompass: true, visualizePitch: false }), 'top-right');
      map.addControl(new ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');

      map.on('error', (e) => {
        // Individual 404 tiles are normal at high zoom; only a style-level
        // failure means the map genuinely cannot render.
        if (!e?.error) return;
        const msg = String(e.error.message ?? '');
        if (msg.includes('style') || msg.includes('Failed to fetch')) setFailed(true);
      });

      mapRef.current = map;
      // Dev-only handle so visual QA can inspect layer and source state.
      if (import.meta.env.DEV) (window as unknown as { __map?: MapLibreMap }).__map = map;
    }

    /* Readiness deliberately does NOT wait for `load` or `isStyleLoaded()`.

       Both of those additionally require the render loop to have completed a
       frame, and requestAnimationFrame is suspended whenever the page is not
       being painted — a background tab, a hidden panel, an offscreen window.
       In that state MapLibre still fetches tiles and still accepts layers, but
       it emits no events at all, so an event-driven gate would strand the
       console on its loading screen until the operator happened to look at it.

       The real precondition for addSource/addLayer is simply that the initial
       style has been parsed, which we detect by asking for a layer we know it
       declares. */
    const live = map;
    const activeBasemapLayer = basemapLayerId(basemap);
    const styleReady = () => {
      try {
        return live.isStyleLoaded() || Boolean(live.getLayer(activeBasemapLayer));
      } catch {
        return false;
      }
    };

    const markReady = () => {
      if (styleReady()) setReady(true);
    };

    markReady();
    live.on('load', markReady);
    live.on('idle', markReady);
    live.on('styledata', markReady);

    const poll = window.setInterval(() => {
      if (styleReady()) {
        setReady(true);
        window.clearInterval(poll);
      }
    }, 120);

    return () => {
      window.clearInterval(poll);
      live.off('load', markReady);
      live.off('idle', markReady);
      live.off('styledata', markReady);
      teardownRef.current = window.setTimeout(() => {
        mapRef.current?.remove();
        mapRef.current = null;
        teardownRef.current = null;
        setReady(false);
      }, 0);
    };
    // Instance is created once; every prop below is applied by its own effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -- Basemap: toggle visibility, never setStyle ------------------------ */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    BASEMAPS.forEach((b) => {
      const id = basemapLayerId(b.id);
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', b.id === basemap ? 'visible' : 'none');
      }
    });
  }, [basemap, ready]);

  /* -- Camera ------------------------------------------------------------ */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fitBounds) {
      map.fitBounds(fitBounds, { padding: 72, duration: reduced ? 0 : 700 });
    } else {
      map.flyTo({ center, zoom, bearing, pitch, duration: reduced ? 0 : 700, essential: true });
    }
    // Camera moves only on an explicit flyKey change, so live telemetry updates
    // never yank the operator's view out from under them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyKey, ready]);

  /* -- Keep the canvas sized to its panel -------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    const host = hostRef.current;
    if (!map || !host) return undefined;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const ctx = useMemo<MapCtx>(() => ({ map: mapRef.current, ready }), [ready]);

  return (
    <div className={`${s.wrap} ${className ?? ''}`}>
      <div ref={hostRef} className={s.canvas} />
      {/* Unmounted rather than faded out: an opacity transition can freeze
          part-way whenever the page is not being painted, leaving a ghost of
          the loading state sitting over live cartography. */}
      {(!ready || failed) && (
        <div className={s.status} aria-live="polite">
          {failed ? (
          <>
              <span>Basemap unavailable</span>
              <span className={s.statusNote}>
                Tiles could not be reached. Incident geometry, telemetry and agent coordination
                remain fully operational — only the cartographic backdrop is missing.
              </span>
            </>
          ) : (
            <span>Loading cartography…</span>
          )}
        </div>
      )}
      <MapContext.Provider value={ctx}>
        {ready && <div className={s.overlays}>{children}</div>}
      </MapContext.Provider>
    </div>
  );
};

/* ------------------------------------------------------------------ Slots */
export const MapSlot: React.FC<{
  at: 'tl' | 'tr' | 'bl' | 'br';
  children: React.ReactNode;
}> = ({ at, children }) => {
  const cls = { tl: s.slotTL, tr: s.slotTR, bl: s.slotBL, br: s.slotBR }[at];
  return <div className={cls}>{children}</div>;
};

/* ----------------------------------------------------------------- Marker */
/**
 * Renders arbitrary React content at a coordinate by portalling into a
 * MapLibre-managed container. This is how every label on the map is drawn —
 * there are no symbol layers, so no glyph server is required.
 */
export const MapMarker: React.FC<{
  lngLat: [number, number];
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  offset?: [number, number];
  rotation?: number;
  /** Higher values draw above other markers. */
  z?: number;
  children: React.ReactNode;
}> = ({ lngLat, anchor = 'center', offset, rotation, z, children }) => {
  const { map, ready } = useMap();
  const elRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map || !ready) return undefined;
    const el = document.createElement('div');
    el.className = s.marker;
    elRef.current = el;
    const marker = new Marker({ element: el, anchor, offset, rotationAlignment: 'viewport' })
      .setLngLat(lngLat)
      .addTo(map);
    markerRef.current = marker;
    setHost(el);
    return () => {
      marker.remove();
      markerRef.current = null;
      setHost(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, anchor]);

  useEffect(() => {
    markerRef.current?.setLngLat(lngLat);
  }, [lngLat]);

  useEffect(() => {
    if (typeof rotation === 'number') markerRef.current?.setRotation(rotation);
  }, [rotation]);

  useEffect(() => {
    if (elRef.current && typeof z === 'number') elRef.current.style.zIndex = String(z);
  }, [z, host]);

  return host ? createPortal(children, host) : null;
};
