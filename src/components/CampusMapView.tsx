import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Search,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Locate,
  Footprints,
  Maximize2,
  Trash2,
  Package,
} from 'lucide-react';
import { CampusReport, LostItem, FoundItem } from '../types';
import { CAMPUS_BUILDINGS } from '../data/initialData';
import {
  calculateDistanceMeters,
  formatDistance,
  estimateWalkingTime,
  getCompassDirection,
  DEFAULT_USER_LOCATION,
  DEFAULT_CAMPUS_CENTER,
  GeoPoint,
} from '../utils/geoDistance';

interface CampusMapViewProps {
  reports: CampusReport[];
  lostItems: LostItem[];
  onNavigate: (tab: string) => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  reports,
  lostItems,
  onNavigate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // User Current Location State (Real GPS or Campus Default)
  const [userLocation, setUserLocation] = useState<GeoPoint>(DEFAULT_USER_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Campus Default: Student Center Plaza');

  // Map Filter & Display States
  const [mapLayerType, setMapLayerType] = useState<'streets' | 'satellite' | 'carto'>('streets');
  const [filterCategory, setFilterCategory] = useState<'all' | 'waste' | 'lost' | 'critical'>('all');
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: 'report' | 'lost' | 'building';
    title: string;
    category: string;
    building: string;
    coords: GeoPoint;
    distanceMeters: number;
    details: string;
    status: string;
    priority?: string;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_CAMPUS_CENTER.lat, DEFAULT_CAMPUS_CENTER.lng],
        zoom: 16,
        zoomControl: true,
      });

      leafletMapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer when mapLayerType changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (mapLayerType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (mapLayerType === 'carto') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
  }, [mapLayerType]);

  // Request Live Device GPS Geolocation
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const liveCoords: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(liveCoords);
        setLocationStatus('📍 Live Device GPS Locked');
        setIsLocating(false);

        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([liveCoords.lat, liveCoords.lng], 17, {
            duration: 1.5,
          });
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setLocationStatus('Campus Default: Student Center Plaza (GPS Unavailable)');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Render Markers on Map with Real Distances
  useEffect(() => {
    const map = leafletMapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Add User Location Marker (Pulse Dot)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 16px; height: 16px; border-radius: 50%; background-color: #2563eb; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(layer);

    userMarker.bindPopup(`
      <div style="font-size: 12px; font-family: sans-serif; padding: 4px;">
        <strong style="color: #2563eb; font-size: 13px;">📍 You Are Here</strong>
        <p style="margin: 4px 0 0 0; color: #64748b;">${locationStatus}</p>
        <p style="margin: 2px 0 0 0; font-family: monospace; font-size: 10px; color: #94a3b8;">
          ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}
        </p>
      </div>
    `);

    // 2. Add Campus Building Markers
    CAMPUS_BUILDINGS.forEach((bld) => {
      const bldDist = calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        bld.geoCoords.lat,
        bld.geoCoords.lng
      );

      const bldIcon = L.divIcon({
        className: 'custom-bld-marker',
        html: `
          <div style="background-color: #334155; color: white; padding: 3px 6px; border-radius: 6px; font-size: 10px; font-weight: bold; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 2px 4px rgba(0,0,0,0.25); white-space: nowrap;">
            🏢 ${bld.code}
          </div>
        `,
        iconAnchor: [20, 10],
      });

      L.marker([bld.geoCoords.lat, bld.geoCoords.lng], { icon: bldIcon }).addTo(layer);
    });

    // 3. Add Waste Report Markers
    if (filterCategory === 'all' || filterCategory === 'waste' || filterCategory === 'critical') {
      reports.forEach((rep) => {
        if (!rep.location.geoCoords) return;
        if (filterCategory === 'critical' && rep.priority !== 'critical') return;

        const distMeters = calculateDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          rep.location.geoCoords.lat,
          rep.location.geoCoords.lng
        );
        const compass = getCompassDirection(
          userLocation.lat,
          userLocation.lng,
          rep.location.geoCoords.lat,
          rep.location.geoCoords.lng
        );
        const walkTime = estimateWalkingTime(distMeters);
        const isCritical = rep.priority === 'critical';
        const isResolved = rep.status === 'resolved';

        const color = isResolved ? '#16a34a' : isCritical ? '#dc2626' : '#f59e0b';
        const labelIcon = isCritical ? '⚠️' : '🗑️';

        const pinIcon = L.divIcon({
          className: 'custom-waste-marker',
          html: `
            <div style="position: relative; cursor: pointer;">
              <div style="background-color: ${color}; color: white; padding: 5px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); white-space: nowrap;">
                <span>${labelIcon}</span>
                <span>${formatDistance(distMeters)}</span>
              </div>
            </div>
          `,
          iconAnchor: [30, 20],
        });

        const marker = L.marker(
          [rep.location.geoCoords.lat, rep.location.geoCoords.lng],
          { icon: pinIcon }
        ).addTo(layer);

        marker.on('click', () => {
          setSelectedItem({
            id: rep.id,
            type: 'report',
            title: rep.title,
            category: rep.category,
            building: rep.location.building,
            coords: rep.location.geoCoords!,
            distanceMeters: distMeters,
            details: rep.description,
            status: rep.status,
            priority: rep.priority,
          });

          // Draw walking route line from user to incident
          drawRouteLine(
            userLocation,
            rep.location.geoCoords!,
            color,
            `${rep.title} (${formatDistance(distMeters)} • ${walkTime} ${compass})`
          );
        });

        marker.bindPopup(`
          <div style="font-size: 12px; font-family: sans-serif; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <strong style="color: ${color};">${rep.id}</strong>
              <span style="background-color: ${color}20; color: ${color}; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${rep.priority}</span>
            </div>
            <h4 style="margin: 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">${rep.title}</h4>
            <p style="margin: 0; color: #475569; font-size: 11px;">📍 ${rep.location.building} (${rep.location.floor})</p>
            <div style="margin-top: 6px; padding: 4px 6px; background-color: #f1f5f9; border-radius: 6px; font-size: 11px; font-weight: bold; color: #334155;">
              🚶 Distance from you: <strong>${formatDistance(distMeters)}</strong> (${walkTime} • Bearing ${compass})
            </div>
          </div>
        `);
      });
    }

    // 4. Add Lost & Found Markers
    if (filterCategory === 'all' || filterCategory === 'lost') {
      lostItems.forEach((lost) => {
        if (!lost.geoCoords) return;

        const distMeters = calculateDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          lost.geoCoords.lat,
          lost.geoCoords.lng
        );
        const compass = getCompassDirection(
          userLocation.lat,
          userLocation.lng,
          lost.geoCoords.lat,
          lost.geoCoords.lng
        );
        const walkTime = estimateWalkingTime(distMeters);

        const pinIcon = L.divIcon({
          className: 'custom-lost-marker',
          html: `
            <div style="background-color: #9333ea; color: white; padding: 5px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); white-space: nowrap;">
              <span>💍</span>
              <span>${formatDistance(distMeters)}</span>
            </div>
          `,
          iconAnchor: [30, 20],
        });

        const marker = L.marker([lost.geoCoords.lat, lost.geoCoords.lng], {
          icon: pinIcon,
        }).addTo(layer);

        marker.on('click', () => {
          setSelectedItem({
            id: lost.id,
            type: 'lost',
            title: lost.title,
            category: lost.category,
            building: lost.building,
            coords: lost.geoCoords!,
            distanceMeters: distMeters,
            details: lost.description,
            status: lost.status,
          });

          drawRouteLine(
            userLocation,
            lost.geoCoords!,
            '#9333ea',
            `Lost Item: ${lost.title} (${formatDistance(distMeters)} • ${walkTime} ${compass})`
          );
        });

        marker.bindPopup(`
          <div style="font-size: 12px; font-family: sans-serif; padding: 4px;">
            <strong style="color: #9333ea;">🔎 Lost Item (${lost.id})</strong>
            <h4 style="margin: 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">${lost.title}</h4>
            <p style="margin: 0; color: #475569; font-size: 11px;">📍 Last seen at ${lost.locationLost}</p>
            <div style="margin-top: 6px; padding: 4px 6px; background-color: #f3e8ff; border-radius: 6px; font-size: 11px; font-weight: bold; color: #7e22ce;">
              🚶 Distance from you: <strong>${formatDistance(distMeters)}</strong> (${walkTime} • Bearing ${compass})
            </div>
          </div>
        `);
      });
    }
  }, [userLocation, reports, lostItems, filterCategory, locationStatus]);

  // Draw Route Polyline from user to destination
  const drawRouteLine = (
    from: GeoPoint,
    to: GeoPoint,
    color: string,
    popupText: string
  ) => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    const polyline = L.polyline(
      [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      {
        color,
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }
    ).addTo(map);

    routeLineRef.current = polyline;

    // Fit bounds smoothly to view both points
    map.fitBounds(polyline.getBounds(), { padding: [60, 60], maxZoom: 18 });
  };

  // Compile Sorted Proximity List for All Items
  const proximityItems = [
    ...reports
      .filter((r) => r.location.geoCoords)
      .map((r) => {
        const meters = calculateDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          r.location.geoCoords!.lat,
          r.location.geoCoords!.lng
        );
        return {
          id: r.id,
          title: r.title,
          category: r.category,
          building: r.location.building,
          type: 'waste' as const,
          priority: r.priority,
          status: r.status,
          distanceMeters: meters,
          walkTime: estimateWalkingTime(meters),
          direction: getCompassDirection(
            userLocation.lat,
            userLocation.lng,
            r.location.geoCoords!.lat,
            r.location.geoCoords!.lng
          ),
          coords: r.location.geoCoords!,
        };
      }),
    ...lostItems
      .filter((l) => l.geoCoords)
      .map((l) => {
        const meters = calculateDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          l.geoCoords!.lat,
          l.geoCoords!.lng
        );
        return {
          id: l.id,
          title: l.title,
          category: l.category,
          building: l.building,
          type: 'lost' as const,
          priority: 'medium',
          status: l.status,
          distanceMeters: meters,
          walkTime: estimateWalkingTime(meters),
          direction: getCompassDirection(
            userLocation.lat,
            userLocation.lng,
            l.geoCoords!.lat,
            l.geoCoords!.lng
          ),
          coords: l.geoCoords!,
        };
      }),
  ].sort((a, b) => a.distanceMeters - b.distanceMeters);

  return (
    <div className="space-y-6">
      {/* Top Banner with Real Geolocation & Distance Tracker */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-700 via-emerald-700 to-blue-800 text-white shadow-xl shadow-teal-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Real GIS Geospatial Engine & OpenStreetMap
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Real Campus Map & Proximity Radar
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
            Real geographic satellite and street telemetry. Calculates live walking distance in meters, heading compass, and estimated pedestrian time to waste incidents and lost items.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleGetLiveLocation}
            disabled={isLocating}
            className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-emerald-50 active:scale-95 transition-all flex items-center space-x-2"
          >
            <Locate className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : '📍 Locate Me / Use My GPS'}</span>
          </button>
        </div>
      </div>

      {/* Control Strip: Tile Layer Toggle & Filter Categories */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        {/* Layer Chooser */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-400 uppercase text-[10px]">Map Style:</span>
          <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setMapLayerType('streets')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mapLayerType === 'streets'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Street Map
            </button>
            <button
              onClick={() => setMapLayerType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mapLayerType === 'satellite'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapLayerType('carto')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mapLayerType === 'carto'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Clean Voyager
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Locations
          </button>
          <button
            onClick={() => setFilterCategory('waste')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold ${
              filterCategory === 'waste'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            🗑️ Waste Issues
          </button>
          <button
            onClick={() => setFilterCategory('critical')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold ${
              filterCategory === 'critical'
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
            }`}
          >
            ⚠️ Critical
          </button>
          <button
            onClick={() => setFilterCategory('lost')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold ${
              filterCategory === 'lost'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
            }`}
          >
            💍 Lost & Found
          </button>
        </div>
      </div>

      {/* Main Map & Live Proximity Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Leaflet Map Viewport */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                Interactive OpenStreetMap & Geodesic Distance Matrix
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              GPS: {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
            </span>
          </div>

          {/* Leaflet DOM Node */}
          <div className="relative aspect-16/10 sm:aspect-16/9 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              💡 <em>Click any pin to trace a direct walking route and display walking time.</em>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Active Proximity Radar: {proximityItems.length} locations tracked
            </span>
          </div>
        </div>

        {/* Right Column: Proximity Leaderboard & Distance Table */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Item Drawer Card */}
          {selectedItem && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/50 p-5 shadow-lg space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    SELECTED DESTINATION
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedItem.building} ({selectedItem.category})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    if (routeLineRef.current && leafletMapRef.current) {
                      leafletMapRef.current.removeLayer(routeLineRef.current);
                      routeLineRef.current = null;
                    }
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Exact Distance Badge */}
              <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Walking Distance
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatDistance(selectedItem.distanceMeters)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Estimated Time
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                    <Footprints className="w-3.5 h-3.5 text-blue-500" />
                    <span>{estimateWalkingTime(selectedItem.distanceMeters)}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedItem.details}
              </p>

              <button
                onClick={() => {
                  if (selectedItem.type === 'report') {
                    onNavigate('tasks');
                  } else {
                    onNavigate('lost-found');
                  }
                }}
                className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>View Full Ticket Information</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sorted Proximity Ranking List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Proximity Radar (Nearest First)
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                From You
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {proximityItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (leafletMapRef.current) {
                      leafletMapRef.current.flyTo([item.coords.lat, item.coords.lng], 18, {
                        duration: 1.2,
                      });
                      drawRouteLine(
                        userLocation,
                        item.coords,
                        item.type === 'waste' ? '#f59e0b' : '#9333ea',
                        `${item.title} (${formatDistance(item.distanceMeters)})`
                      );
                    }
                  }}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-500 cursor-pointer transition-all text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[170px]">
                      {item.type === 'waste' ? '🗑️ ' : '💍 '}
                      {item.title}
                    </span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {formatDistance(item.distanceMeters)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.building}</span>
                    <span className="flex items-center space-x-1 text-slate-400 font-mono">
                      <Compass className="w-3 h-3 text-blue-500" />
                      <span>{item.walkTime} ({item.direction})</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
