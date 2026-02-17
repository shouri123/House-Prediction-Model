import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { formatCurrency, getColorForPrice } from '../utils';
import 'leaflet/dist/leaflet.css';

function FitBounds({ markers }) {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const lats = markers.map((m) => m.lat);
            const lngs = markers.map((m) => m.lng);
            map.fitBounds([
                [Math.min(...lats), Math.min(...lngs)],
                [Math.max(...lats), Math.max(...lngs)],
            ], { padding: [30, 30] });
        }
    }, [markers, map]);
    return null;
}

const MapView = ({ data, outlierIndices = [] }) => {
    if (!data || data.length === 0) return null;

    const markers = data
        .filter((d) => d.latitude && d.longitude)
        .map((d, i) => ({
            lat: d.latitude,
            lng: d.longitude,
            price: d.predicted_price,
            income: d.median_income,
            ocean: d.ocean_proximity,
            isOutlier: outlierIndices.includes(i),
            index: i,
        }));

    if (markers.length === 0) return null;

    const prices = markers.map((m) => m.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const center = [
        markers.reduce((s, m) => s + m.lat, 0) / markers.length,
        markers.reduce((s, m) => s + m.lng, 0) / markers.length,
    ];

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-1">📍 Geospatial View</h3>
            <p className="text-sm text-gray-400 mb-4">Properties colored by predicted price (green = low, red = high)</p>
            <div className="rounded-xl overflow-hidden border border-gray-700/50" style={{ height: 400 }}>
                <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <FitBounds markers={markers} />
                    {markers.map((m) => (
                        <CircleMarker
                            key={m.index}
                            center={[m.lat, m.lng]}
                            radius={m.isOutlier ? 10 : 7}
                            pathOptions={{
                                color: m.isOutlier ? '#F59E0B' : getColorForPrice(m.price, minPrice, maxPrice),
                                fillColor: m.isOutlier ? '#F59E0B' : getColorForPrice(m.price, minPrice, maxPrice),
                                fillOpacity: 0.8,
                                weight: m.isOutlier ? 3 : 1,
                            }}
                        >
                            <Popup>
                                <div style={{ color: '#1F2937', minWidth: 150 }}>
                                    <strong style={{ fontSize: 16 }}>{formatCurrency(m.price)}</strong>
                                    {m.isOutlier && <span style={{ color: '#D97706', marginLeft: 6 }}>⚠ Outlier</span>}
                                    <br />
                                    <small>Income: {m.income?.toFixed(2)}</small><br />
                                    <small>Ocean: {m.ocean}</small><br />
                                    <small>Lat: {m.lat}, Lng: {m.lng}</small>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-green-500" /> Low
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" /> Mid
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> High
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded-full border-2 border-amber-500" /> Outlier
                </div>
            </div>
        </div>
    );
};

export default MapView;
