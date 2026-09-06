import React, { useMemo, useState } from 'react';
import { Navigation, ShieldCheck, Wind, Waves, Layers, Plane } from 'lucide-react';

import { MapCanvas, MapMarker, MapSlot } from './MapCanvas';
import { GeoJsonLayer } from './layers/GeoJsonLayer';
import { BASEMAPS, type BasemapId } from './basemaps';
import {
  boundsOf,
  driftConeToGeoJSON,
  pointsToGeoJSON,
  routeToGeoJSON,
  toLngLat,
  zonesToGeoJSON,
} from '../lib/geo';
import { bearing, compass, countdown, knots, latLon, nm } from '../lib/format';
import { Button, Eyebrow, Pill, Toggle } from '../components/primitives';
import { useIncident } from '../state/IncidentContext';
import type { Coordinates } from '../types/incident';
import type { CivilianHelpRequest } from '../types/civilian';
import s from './IncidentMap.module.css';

/* ============================================================================
   IncidentMap — the shared cartographic instrument.

   Every module that shows a map uses this one component and simply turns
   layers on or off. That is what keeps the five screens feeling like one
   product rather than five separately-built pages.
   ============================================================================ */

export interface MapLayerState {
  zones: boolean;
  cone: boolean;
  route: boolean;
  distress: boolean;
  safeZones: boolean;
  helipads: boolean;
}

export const DEFAULT_LAYERS: MapLayerState = {
  zones: true,
  cone: true,
  route: true,
  distress: true,
  safeZones: true,
  helipads: false,
};

/** Area centroid — places a zone label inside its polygon, not at its bbox centre. */
const centroid = (poly: Coordinates[]): [number, number] => {
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const p0 = poly[j];
    const p1 = poly[i];
    const f = p0.longitude * p1.latitude - p1.longitude * p0.latitude;
    twiceArea += f;
    x += (p0.longitude + p1.longitude) * f;
    y += (p0.latitude + p1.latitude) * f;
  }
  if (twiceArea === 0) return toLngLat(poly[0]);
  const f = twiceArea * 3;
  return [x / f, y / f];
};

const severityClass: Record<CivilianHelpRequest['severity'], string> = {
  CRITICAL: s.dCritical,
  URGENT: s.dUrgent,
  STANDARD: s.dStandard,
  NON_URGENT: s.dNonUrgent,
};

/* Helipads named in the mockups. Fixed drill geography, not live data. */
const HELIPADS: Array<{ id: string; name: string; at: Coordinates }> = [
  { id: 'heli-1', name: 'Helipad 1 · Flåm School Field', at: { latitude: 60.8664, longitude: 7.1158 } },
  { id: 'heli-2', name: 'Helipad 2 · Flåm Gym Field', at: { latitude: 60.8607, longitude: 7.1193 } },
];

export interface IncidentMapProps {
  layers?: Partial<MapLayerState>;
  defaultBasemap?: BasemapId;
  zoom?: number;
  /** Centre override; defaults to framing the vessel and the safe zone together. */
  center?: [number, number];
  flyKey?: string | number;
  showLayerPanel?: boolean;
  showReadout?: boolean;
  showVesselCallout?: boolean;
  onSelectDistress?: (req: CivilianHelpRequest) => void;
  selectedDistressId?: string | null;
  className?: string;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  layers: layerOverrides,
  defaultBasemap = 'aerial',
  zoom = 13.6,
  center,
  flyKey,
  showLayerPanel = true,
  showReadout = true,
  showVesselCallout = true,
  onSelectDistress,
  selectedDistressId,
  className,
}) => {
  const { incident, helpRequests, currentStage } = useIncident();
  const [basemap, setBasemap] = useState<BasemapId>(defaultBasemap);
  const [layers, setLayers] = useState<MapLayerState>({ ...DEFAULT_LAYERS, ...layerOverrides });

  /* At 390px the layer panel covers most of the map, so on small screens it
     starts collapsed behind its own icon and opens on tap. Desktop is
     unchanged — the panel is genuinely useful there and there is room for it. */
  const isNarrow =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches;
  const [layersOpen, setLayersOpen] = useState(!isNarrow);

  const vessel = incident.vessel;
  const vesselAt: Coordinates = { latitude: vessel.latitude, longitude: vessel.longitude };

  const zonesFC = useMemo(() => zonesToGeoJSON(incident.zones), [incident.zones]);
  const routeFC = useMemo(() => routeToGeoJSON(incident.defaultRoute), [incident.defaultRoute]);
  const coneFC = useMemo(
    () =>
      driftConeToGeoJSON(
        vesselAt,
        vessel.headingDegrees,
        Math.max(0.15, vessel.distanceToHarborNm),
        currentStage.vesselUpdate?.driftConeDegrees ?? 26
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vessel.latitude, vessel.longitude, vessel.headingDegrees, vessel.distanceToHarborNm, currentStage]
  );

  const distressFC = useMemo(
    () =>
      pointsToGeoJSON(
        helpRequests.map((r) => ({ coordinates: r.coordinates, props: { id: r.id } }))
      ),
    [helpRequests]
  );

  /* Frame every piece of live geometry — vessel, both hazard zones, the safe
     area and the evacuation route — so nothing important sits off-screen.
     A hardcoded centre cropped Zone A and Zone B entirely. */
  const incidentBounds = useMemo(() => {
    const pts: Coordinates[] = [
      vesselAt,
      { latitude: incident.primarySafeZone.latitude, longitude: incident.primarySafeZone.longitude },
      ...incident.zones.flatMap((z) => z.polygon),
      ...incident.defaultRoute.waypoints,
    ];
    return boundsOf(pts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident.zones, incident.primarySafeZone, incident.defaultRoute, vessel.latitude, vessel.longitude]);

  const mapCenter: [number, number] = center ?? [7.1205, 60.8672];

  return (
    <MapCanvas
      className={className}
      basemap={basemap}
      center={mapCenter}
      zoom={zoom}
      fitBounds={center ? undefined : incidentBounds ?? undefined}
      flyKey={flyKey ?? basemap}
    >
      {/* ---- Geometry. Order here is paint order. ---- */}
      <GeoJsonLayer
        id="drift-cone"
        data={coneFC}
        visible={layers.cone}
        layers={[
          { type: 'fill', paint: { 'fill-color': '#B83A32', 'fill-opacity': 0.14 } },
          {
            type: 'line',
            paint: {
              'line-color': '#E85D54',
              'line-width': 1,
              'line-dasharray': [3, 2],
              'line-opacity': 0.75,
            },
          },
        ]}
      />
      <GeoJsonLayer
        id="hazard-zones"
        data={zonesFC}
        visible={layers.zones}
        layers={[
          { type: 'fill', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.22 } },
          {
            type: 'line',
            paint: { 'line-color': ['get', 'color'], 'line-width': 1.6, 'line-opacity': 0.95 },
          },
        ]}
      />
      <GeoJsonLayer
        id="evac-route"
        data={routeFC}
        visible={layers.route}
        layers={[
          // Casing first so the route stays legible over both aerial and topo.
          {
            type: 'line',
            paint: { 'line-color': '#0A0C0D', 'line-width': 6, 'line-opacity': 0.55 },
            layout: { 'line-cap': 'round', 'line-join': 'round' },
          },
          {
            type: 'line',
            paint: { 'line-color': '#4FBF8B', 'line-width': 3 },
            layout: { 'line-cap': 'round', 'line-join': 'round' },
          },
        ]}
      />
      <GeoJsonLayer
        id="distress-halo"
        data={distressFC}
        visible={layers.distress}
        layers={[
          {
            type: 'circle',
            paint: {
              'circle-radius': 13,
              'circle-color': '#E5484D',
              'circle-opacity': 0.12,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#E5484D',
              'circle-stroke-opacity': 0.3,
            },
          },
        ]}
      />

      {/* ---- Zone labels ---- */}
      {layers.zones &&
        incident.zones.map((z) => (
          /* Zone A and Zone B share almost the same centroid over Flåm, so the
             labels are pushed apart vertically instead of stacking on top of
             each other. */
          <MapMarker
            key={z.id}
            lngLat={centroid(z.polygon)}
            offset={z.level === 'CRITICAL_IMPACT' ? [0, -13] : [0, 13]}
            z={4}
          >
            <span
              className={`${s.zoneLabel} ${
                z.level === 'CRITICAL_IMPACT' ? s.zoneCritical : s.zoneWarning
              }`}
            >
              {z.level === 'CRITICAL_IMPACT' ? 'Zone A · Impact' : 'Zone B · Warning'}
            </span>
          </MapMarker>
        ))}

      {/* ---- Place name. Sits west of the zone chips so the two never collide. ---- */}
      <MapMarker lngLat={[7.1078, 60.8598]} z={3}>
        <span className={s.place}>FLÅM</span>
      </MapMarker>

      {/* ---- Safe zone ---- */}
      {layers.safeZones && (
        <MapMarker
          lngLat={[incident.primarySafeZone.longitude, incident.primarySafeZone.latitude]}
          z={6}
        >
          <span className={s.pin}>
            <span className={`${s.pinDisc} ${s.pinSafe}`}>
              <ShieldCheck size={14} strokeWidth={2} />
            </span>
            <span className={s.pinLabel}>{incident.primarySafeZone.name}</span>
          </span>
        </MapMarker>
      )}

      {/* ---- Helipads ---- */}
      {layers.helipads &&
        HELIPADS.map((h) => (
          <MapMarker key={h.id} lngLat={toLngLat(h.at)} z={5}>
            <span className={s.pin}>
              <span className={`${s.pinDisc} ${s.pinHeli}`}>
                <Plane size={13} strokeWidth={2} />
              </span>
              <span className={s.pinLabel}>{h.name}</span>
            </span>
          </MapMarker>
        ))}

      {/* ---- Distress pins ---- */}
      {layers.distress &&
        helpRequests.map((r) => (
          <MapMarker key={r.id} lngLat={toLngLat(r.coordinates)} z={selectedDistressId === r.id ? 9 : 7}>
            <button
              type="button"
              aria-label={`Distress request from ${r.civilianAlias}`}
              className={`${s.distress} ${
                r.state === 'RESCUED' ? s.dResolved : severityClass[r.severity]
              }`}
              style={selectedDistressId === r.id ? { transform: 'scale(1.5)' } : undefined}
              onClick={() => onSelectDistress?.(r)}
            />
          </MapMarker>
        ))}

      {/* ---- Vessel ---- */}
      <MapMarker lngLat={toLngLat(vesselAt)} z={10}>
        <span className={s.vessel}>
          <span
            className={`${s.vesselGlyph} ${s.vesselHeading}`}
            style={{ transform: `rotate(${vessel.headingDegrees}deg)` }}
          >
            <Navigation size={17} strokeWidth={2.2} fill="currentColor" />
          </span>
          {showVesselCallout && (
            <span className={s.vesselCallout}>
              <span className={s.vesselName}>{vessel.name}</span>
              <span className={s.vesselRow}>
                <span>{knots(vessel.speedKnots)} kn</span>
                <span>
                  {bearing(vessel.headingDegrees)} {compass(vessel.headingDegrees)}
                </span>
                <span>{nm(vessel.distanceToHarborNm)} nm</span>
              </span>
              <span className={s.vesselEta}>
                ETA IMPACT {countdown(vessel.estimatedTimeToImpactSeconds)}
              </span>
            </span>
          )}
        </span>
      </MapMarker>

      {/* ---- Floating overlays. LAW 3: glass lives only here. ---- */}
      {showLayerPanel && (
        <MapSlot at="tl">
          <div className={`${s.float} ${layersOpen ? s.layerPanel : s.layerPanelClosed}`}>
            <button
              type="button"
              className={s.layerPanelHead}
              aria-expanded={layersOpen}
              aria-label={layersOpen ? 'Hide map layers' : 'Show map layers'}
              onClick={() => setLayersOpen((v) => !v)}
            >
              {layersOpen && <Eyebrow>Map layers</Eyebrow>}
              <Layers size={15} strokeWidth={1.5} color="var(--text-faint)" />
            </button>
            {layersOpen && (
            <>
            <Toggle
              checked={layers.zones}
              onChange={(v) => setLayers((p) => ({ ...p, zones: v }))}
              label="Hazard zones"
              swatch="#E85D54"
            />
            <Toggle
              checked={layers.cone}
              onChange={(v) => setLayers((p) => ({ ...p, cone: v }))}
              label="Drift cone"
              swatch="#B83A32"
            />
            <Toggle
              checked={layers.route}
              onChange={(v) => setLayers((p) => ({ ...p, route: v }))}
              label="Evacuation route"
              swatch="#4FBF8B"
            />
            <Toggle
              checked={layers.safeZones}
              onChange={(v) => setLayers((p) => ({ ...p, safeZones: v }))}
              label="Safe areas"
              swatch="#2F6B53"
            />
            <Toggle
              checked={layers.helipads}
              onChange={(v) => setLayers((p) => ({ ...p, helipads: v }))}
              label="Helipads"
              swatch="#2A6070"
            />
            <Toggle
              checked={layers.distress}
              onChange={(v) => setLayers((p) => ({ ...p, distress: v }))}
              label={`Distress signals (${helpRequests.length})`}
              swatch="#E5484D"
            />

            <div className={s.basemapRow}>
              {BASEMAPS.map((b) => (
                <Button
                  key={b.id}
                  size="sm"
                  variant="ghost"
                  on={basemap === b.id}
                  onClick={() => setBasemap(b.id)}
                  title={b.provenance}
                  style={{ flex: 1, padding: '0 6px' }}
                >
                  {b.label.split(' ')[0]}
                </Button>
              ))}
            </div>
            <span className={s.provenance}>
              {BASEMAPS.find((b) => b.id === basemap)?.provenance}
            </span>
            </>
            )}
          </div>
        </MapSlot>
      )}

      {showReadout && (
        <MapSlot at="bl">
          <div className={`${s.float} ${s.readout}`}>
            <Eyebrow>Conditions</Eyebrow>
            <span className={s.readoutRow}>
              <span>
                <Wind size={11} strokeWidth={1.5} /> Wind
              </span>
              <span className={s.readoutVal}>12 m/s NW</span>
            </span>
            <span className={s.readoutRow}>
              <span>
                <Waves size={11} strokeWidth={1.5} /> Current
              </span>
              <span className={s.readoutVal}>1.2 kn E</span>
            </span>
            <span className={s.readoutRow}>
              <span>Vessel</span>
              <span className={s.readoutVal}>{latLon(vesselAt)}</span>
            </span>
            <Pill tone="fjord" dot>
              AIS · RADAR SIMULATED
            </Pill>
          </div>
        </MapSlot>
      )}
    </MapCanvas>
  );
};
