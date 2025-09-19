import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import { featureCollection, point } from '@turf/helpers';
import clustersDbscan from '@turf/clusters-dbscan';

export async function GET(request: Request) {
  console.log("\n--- HOTSPOT API TRIGGERED ---");
  await dbConnect();
  try {
    const reportsWithCoords = await Report.find({
      'coordinates.lat': { $ne: null },
      'coordinates.lon': { $ne: null }
    }).lean();

    console.log(`STEP 1: Found ${reportsWithCoords.length} reports with coordinates in the database.`);

    const MIN_POINTS = 3;
    const MAX_DISTANCE_KM = 20;

    if (reportsWithCoords.length < MIN_POINTS) {
      console.log(`Not enough reports to form a cluster. Needed ${MIN_POINTS}, found ${reportsWithCoords.length}.`);
      return NextResponse.json([], { status: 200 });
    }

    const points = featureCollection(
      reportsWithCoords.map(r => point([r.coordinates!.lon, r.coordinates!.lat], { db_id: r._id }))
    );
    
    // Log only the coordinates for readability
    console.log("STEP 2: Converted reports to GeoJSON points:", JSON.stringify(points.features.map(f => f.geometry.coordinates), null, 2));

    console.log(`STEP 3: Running DBSCAN with distance=${MAX_DISTANCE_KM}km and minPoints=${MIN_POINTS}`);
    
    const clustered = clustersDbscan(points, MAX_DISTANCE_KM, { minPoints: MIN_POINTS });
    
    console.log("STEP 4: Raw result from DBSCAN:", JSON.stringify(clustered.features.map(f => f.properties), null, 2));

    const hotspotData: { [key: string]: any[] } = {};
    clustered.features.forEach(feature => {
      const clusterId = feature.properties.cluster;
      if (clusterId !== undefined) {
        if (!hotspotData[clusterId]) {
          hotspotData[clusterId] = [];
        }
        hotspotData[clusterId].push(feature.geometry.coordinates);
      }
    });

    const hotspots = Object.values(hotspotData).map(clusterPoints => {
      const count = clusterPoints.length;
      const centerLon = clusterPoints.reduce((sum, p) => sum + p[0], 0) / count;
      const centerLat = clusterPoints.reduce((sum, p) => sum + p[1], 0) / count;
      
      return {
        lat: centerLat,
        lon: centerLon,
        count: count,
      };
    });
    
    console.log("STEP 5: Final Hotspots Calculated:", hotspots);

    return NextResponse.json(hotspots, { status: 200 });

  } catch (error) {
    console.error("---!! HOTSPOT CALCULATION CRASHED !! ---", error);
    return NextResponse.json({ message: 'Server error during hotspot calculation' }, { status: 500 });
  }
}