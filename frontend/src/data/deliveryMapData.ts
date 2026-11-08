export type LatLng = [latitude: number, longitude: number]
export type DeliveryMarkerKind = 'warehouse' | 'shipment' | 'destination' | 'disruption'
export type DisruptionKind = 'Flood' | 'Cyclone watch' | 'Road closure' | 'Transport strike'

export interface DeliveryMapMarker {
  id: string
  kind: DeliveryMarkerKind
  name: string
  location: string
  status: string
  details: string
  position: LatLng
  disruptionKind?: DisruptionKind
}

export interface DeliveryRoute {
  id: string
  name: string
  status: string
  details: string
  positions: LatLng[]
}

// Sample operational coordinates only. Replace these exported collections with API data when available.
export const deliveryMapMarkers: DeliveryMapMarker[] = [
  { id: 'wh-chennai-north', kind: 'warehouse', name: 'Chennai North Distribution Centre', location: 'Madhavaram, Chennai', status: 'Operational', details: 'Regional sort hub · 1,240 parcels processed today', position: [13.1486, 80.2306] },
  { id: 'wh-coimbatore', kind: 'warehouse', name: 'Coimbatore Fulfilment Hub', location: 'Neelambur, Coimbatore', status: 'Operational', details: 'Western region warehouse · 680 parcels processed today', position: [11.0582, 77.0867] },
  { id: 'wh-madurai', kind: 'warehouse', name: 'Madurai South Depot', location: 'Kappalur, Madurai', status: 'Operational', details: 'Southern region cross-dock · 410 parcels processed today', position: [9.8601, 78.0821] },
  { id: 'shipment-78420319', kind: 'shipment', name: 'Shipment TN-78420319', location: 'Chennai North Hub', status: 'Delayed · In transit', details: 'Last scan 36 minutes ago · Destination: Adyar, Chennai', position: [13.0732, 80.2211] },
  { id: 'shipment-78419852', kind: 'shipment', name: 'Shipment TN-78419852', location: 'Salem Transit Hub', status: 'In transit', details: 'On schedule · Destination: Gandhipuram, Coimbatore', position: [11.6643, 78.1460] },
  { id: 'shipment-78417643', kind: 'shipment', name: 'Shipment TN-78417643', location: 'Tiruchirappalli Transit Hub', status: 'In transit', details: 'Arrived at transit hub · Destination: Anna Nagar, Madurai', position: [10.7905, 78.7047] },
  { id: 'destination-adyar', kind: 'destination', name: 'Delivery · Adyar', location: 'Adyar, Chennai', status: 'Delivery delayed', details: 'Customer Arun Kumar · Order TN-78420319 · ETA pending regional clearance', position: [13.0012, 80.2565] },
  { id: 'destination-coimbatore', kind: 'destination', name: 'Delivery · Gandhipuram', location: 'Gandhipuram, Coimbatore', status: 'Out for delivery', details: 'Customer Meera Iyer · Order TN-78419852 · Estimated before 6:00 PM', position: [11.0183, 76.9674] },
  { id: 'destination-madurai', kind: 'destination', name: 'Delivery · Anna Nagar', location: 'Anna Nagar, Madurai', status: 'In transit', details: 'Customer S. Venkatesh · Order TN-78417643 · Estimated tomorrow, 11:00 AM', position: [9.9366, 78.1378] },
  { id: 'event-adyar-flood', kind: 'disruption', disruptionKind: 'Flood', name: 'Adyar River flood watch', location: 'Adyar basin, Chennai', status: 'Moderate alert', details: 'Waterlogging reported on low-lying approach roads · 8 delivery zones under monitoring', position: [12.9827, 80.2209] },
  { id: 'event-nagapattinam-cyclone', kind: 'disruption', disruptionKind: 'Cyclone watch', name: 'Coastal weather watch', location: 'Nagapattinam coast', status: 'Watch', details: 'Heavy rain and high-wind advisory · Coastal linehaul operating with caution', position: [10.7656, 79.8428] },
  { id: 'event-erode-road', kind: 'disruption', disruptionKind: 'Road closure', name: 'NH 544 road closure', location: 'Perundurai, Erode district', status: 'Active diversion', details: 'Eastbound lane closure · Salem–Coimbatore route may add up to 4 hours', position: [11.2755, 77.5840] },
  { id: 'event-madurai-strike', kind: 'disruption', disruptionKind: 'Transport strike', name: 'Regional transport disruption', location: 'Mattuthavani, Madurai', status: 'Monitoring', details: 'Local transport services reduced · Last-mile delivery capacity may be affected', position: [9.9399, 78.1432] },
]

export const deliveryRoutes: DeliveryRoute[] = [
  { id: 'route-west', name: 'Chennai → Salem → Coimbatore', status: 'Active · 1 delay', details: 'Primary western corridor · NH 48 / NH 544', positions: [[13.1486, 80.2306], [12.9165, 79.1325], [11.6643, 78.1460], [11.2755, 77.5840], [11.0582, 77.0867], [11.0183, 76.9674]] },
  { id: 'route-south', name: 'Chennai → Tiruchirappalli → Madurai', status: 'Active · On schedule', details: 'Southern trunk corridor · NH 38', positions: [[13.1486, 80.2306], [11.9570, 79.7737], [10.7905, 78.7047], [9.8601, 78.0821], [9.9366, 78.1378]] },
  { id: 'route-coast', name: 'Chennai → Cuddalore → Nagapattinam', status: 'Weather watch', details: 'Coastal corridor · monitoring rain and wind conditions', positions: [[13.1486, 80.2306], [12.0000, 79.8500], [11.7480, 79.7714], [10.7656, 79.8428]] },
]
