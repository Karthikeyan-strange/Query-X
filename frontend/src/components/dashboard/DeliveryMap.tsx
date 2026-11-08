import { Component, useEffect, useMemo, useState, type ErrorInfo, type ReactNode } from 'react'
import { CircleAlert, CloudRain, LocateFixed, MapPin, Package, RotateCcw, Warehouse } from 'lucide-react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { deliveryMapMarkers, deliveryRoutes, type DeliveryMapMarker, type DeliveryMarkerKind, type DeliveryRoute } from '../../data/deliveryMapData'

type MapFilters = Record<DeliveryMarkerKind | 'routes', boolean>
const tamilNaduCenter: [number, number] = [10.95, 78.25]
const initialZoom = 7

const markerStyles: Record<DeliveryMarkerKind, { glyph: string; className: string; label: string }> = {
  warehouse: { glyph: 'W', className: 'map-marker-warehouse', label: 'Warehouse' },
  shipment: { glyph: 'S', className: 'map-marker-shipment', label: 'Shipment' },
  destination: { glyph: 'D', className: 'map-marker-destination', label: 'Delivery destination' },
  disruption: { glyph: '!', className: 'map-marker-disruption', label: 'Regional disruption' },
}

function markerIcon(kind: DeliveryMarkerKind, disruptionKind?: string) {
  const marker = markerStyles[kind]
  const modifier = disruptionKind ? ` map-marker-${disruptionKind.toLowerCase().replaceAll(' ', '-')}` : ''
  return L.divIcon({
    className: 'delivery-marker-icon',
    html: `<span class="delivery-marker ${marker.className}${modifier}" aria-hidden="true"><span>${marker.glyph}</span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -37],
  })
}

const markerIcons = new Map<string, L.DivIcon>()
function getMarkerIcon(kind: DeliveryMarkerKind, disruptionKind?: string) {
  const key = `${kind}-${disruptionKind ?? ''}`
  const cached = markerIcons.get(key)
  if (cached) return cached
  const icon = markerIcon(kind, disruptionKind)
  markerIcons.set(key, icon)
  return icon
}

function MapViewportController() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    const resetMap = () => map.setView(tamilNaduCenter, initialZoom)
    observer.observe(container)
    window.addEventListener('delivery-map-reset', resetMap)
    return () => { observer.disconnect(); window.removeEventListener('delivery-map-reset', resetMap) }
  }, [map])
  return <button className="map-reset-control" type="button" title="Reset map view" aria-label="Reset map view" onClick={() => map.setView(tamilNaduCenter, initialZoom)}><LocateFixed size={16} /></button>
}

type MapLayerProps = MapFilters & { markers: DeliveryMapMarker[]; routeData: DeliveryRoute[] }

function MapTiles({ warehouse: showWarehouses, shipment: showShipments, destination: showDestinations, disruption: showDisruptions, routes: showRoutes, markers, routeData }: MapLayerProps) {
  const [loading, setLoading] = useState(true)
  const [tileError, setTileError] = useState(false)
  const visible = useMemo(() => markers.filter((marker) => ({
    warehouse: showWarehouses,
    shipment: showShipments,
    destination: showDestinations,
    disruption: showDisruptions,
  })[marker.kind]), [markers, showWarehouses, showShipments, showDestinations, showDisruptions])

  return <>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
      eventHandlers={{
        loading: () => { setLoading(true); setTileError(false) },
        load: () => setLoading(false),
        tileerror: () => { setLoading(false); setTileError(true) },
      }}
    />
    {showRoutes && routeData.map((route, index) => <Polyline
      key={route.id}
      positions={route.positions}
      pathOptions={{ color: ['#835b42', '#b47c00', '#0a8080'][index % 3], weight: 3, opacity: .78, dashArray: index === 2 ? '7 7' : undefined }}
    ><Popup><div className="delivery-popup"><b>{route.name}</b><span>{route.status}</span><small>{route.details}</small></div></Popup></Polyline>)}
    {visible.map((marker) => <Marker
      key={marker.id}
      position={marker.position}
      icon={getMarkerIcon(marker.kind, marker.disruptionKind)}
      title={`${markerStyles[marker.kind].label}: ${marker.name}`}
      alt={`${markerStyles[marker.kind].label}: ${marker.name}`}
    ><Popup><MarkerPopup marker={marker} /></Popup></Marker>)}
    <MapViewportController />
    {loading && <div className="map-message map-loading" role="status"><span className="map-spinner" />Loading OpenStreetMap tiles…</div>}
    {tileError && <div className="map-message map-tile-error" role="status"><CircleAlert size={15} /> Some map tiles could not load. Check your connection or try panning.</div>}
  </>
}

function MarkerPopup({ marker }: { marker: DeliveryMapMarker }) {
  const style = markerStyles[marker.kind]
  return <div className="delivery-popup">
    <span className={`popup-kind ${style.className}`}>{style.label}{marker.disruptionKind ? ` · ${marker.disruptionKind}` : ''}</span>
    <b>{marker.name}</b><span>{marker.location}</span>
    <strong className={marker.kind === 'disruption' ? 'popup-status-alert' : ''}>{marker.status}</strong>
    <small>{marker.details}</small>
  </div>
}

class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Delivery map failed to render', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) return <div className="delivery-map-fallback" role="alert"><CircleAlert size={22} /><b>Map could not be displayed</b><span>Refresh the dashboard to try loading the map again.</span><button onClick={() => window.location.reload()}><RotateCcw size={14} /> Refresh map</button></div>
    return this.props.children
  }
}

function FilterToggle({ checked, label, icon, onChange }: { checked: boolean; label: string; icon: ReactNode; onChange: () => void }) {
  return <button className={`delivery-filter${checked ? ' filter-enabled' : ''}`} role="switch" aria-checked={checked} onClick={onChange}><span className="delivery-filter-icon">{icon}</span><span>{label}</span><i /></button>
}

export interface DeliveryMapProps {
  markers?: DeliveryMapMarker[]
  routes?: DeliveryRoute[]
}

export default function DeliveryMap({ markers = deliveryMapMarkers, routes = deliveryRoutes }: DeliveryMapProps) {
  const [filters, setFilters] = useState<MapFilters>({ warehouse: true, shipment: true, destination: true, disruption: true, routes: true })
  function toggle(key: keyof MapFilters) { setFilters((current) => ({ ...current, [key]: !current[key] })) }

  return <section className="panel map-panel delivery-map-panel">
    <div className="panel-heading map-heading"><div><span className="section-kicker">LIVE REGIONAL INTELLIGENCE</span><h2>Regional disruptions <span className="live-pill"><i /> LIVE</span></h2><p>Tamil Nadu · OpenStreetMap · Sample operational data</p></div><button className="map-reset-button" type="button" title="Reset map view" onClick={() => window.dispatchEvent(new CustomEvent('delivery-map-reset'))}><RotateCcw size={15} /><span>Reset</span></button></div>
    <div className="delivery-map-filters" aria-label="Map layers">
      <FilterToggle checked={filters.warehouse} label="Warehouses" icon={<Warehouse size={14} />} onChange={() => toggle('warehouse')} />
      <FilterToggle checked={filters.shipment} label="Shipments" icon={<Package size={14} />} onChange={() => toggle('shipment')} />
      <FilterToggle checked={filters.destination} label="Destinations" icon={<MapPin size={14} />} onChange={() => toggle('destination')} />
      <FilterToggle checked={filters.disruption} label="Disruptions" icon={<CloudRain size={14} />} onChange={() => toggle('disruption')} />
      <FilterToggle checked={filters.routes} label="Routes" icon={<span className="route-filter-glyph" />} onChange={() => toggle('routes')} />
    </div>
    <div className="delivery-map-frame"><MapErrorBoundary><MapContainer center={tamilNaduCenter} zoom={initialZoom} minZoom={5} maxZoom={18} scrollWheelZoom zoomControl className="delivery-leaflet-map"><MapTiles {...filters} markers={markers} routeData={routes} /></MapContainer></MapErrorBoundary></div>
    <div className="delivery-map-legend" aria-label="Map marker legend">
      {(['warehouse', 'shipment', 'destination', 'disruption'] as DeliveryMarkerKind[]).map((kind) => <span key={kind}><i className={`legend-marker ${markerStyles[kind].className}`} />{markerStyles[kind].label}</span>)}
      <span><i className="legend-route" />Delivery route</span>
    </div>
  </section>
}
