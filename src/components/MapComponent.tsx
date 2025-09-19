'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';

// Define the Report type to match what we pass from the dashboard
interface Report {
  _id: string;
  hazardType: string;
  status: string;
  coordinates?: { lat: number; lon: number };
}
interface Hotspot {
  lat: number;
  lon: number;
  count: number;
}
interface MapProps {
  reports: Report[];
    hotspots: Hotspot[];
}


// Create a custom icon to replace the default blue one
const customIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // A simple map pin icon
  iconSize: [38, 38], 
});

const MapComponent = ({ reports, hotspots }: MapProps) => {
  // Filter for reports that have valid coordinates
  console.log("Hotspots received by MapComponent:", hotspots);
  const reportsWithCoords = reports.filter(report => report.coordinates?.lat && report.coordinates?.lon);

  return (
<MapContainer center={[13.0, 79.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
         <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Render report markers */}
      {reportsWithCoords.map((report) => (
        <Marker key={report._id} position={[report.coordinates!.lat, report.coordinates!.lon]} icon={customIcon}>
          <Popup>
            <div className="font-bold capitalize">{report.hazardType.replace('-', ' ')}</div>
            <div>Status: <span className="font-semibold capitalize">{report.status}</span></div>
          </Popup>
        </Marker>
      ))}
      
      {/* Render hotspot circles */}
      {hotspots.map((hotspot, index) => (
        <Circle
          key={`hotspot-${index}`}
          center={[hotspot.lat, hotspot.lon]}
          pathOptions={{ color: 'red', fillColor: 'red' }}
          radius={2000} // Radius in meters (~2km)
        >
          <Popup>
            <div className="font-bold">Hotspot Detected</div>
            <div>{hotspot.count} reports in this area.</div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default MapComponent;