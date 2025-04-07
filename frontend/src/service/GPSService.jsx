import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Icon untuk lokasi awal (hijau)
const startIcon = new L.Icon({
    iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icon untuk lokasi saat ini (biru)
const currentIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icon untuk tujuan (merah)
const destinationIcon = new L.Icon({
    iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const GPSMap = ({ orderLocation }) => {
    const [position, setPosition] = useState([orderLocation.lat, orderLocation.lng]);
    const [startPosition, setStartPosition] = useState(null);
    const [route, setRoute] = useState([]);

    useEffect(() => {
        if (orderLocation.lat && orderLocation.lng) {
            const currentPos = [orderLocation.lat, orderLocation.lng];
            setPosition(currentPos);

            if (!startPosition) {
                const firstCompletedStep = orderLocation.tracking.find(step => step.completed);
                if (firstCompletedStep) {
                    const simulatedStart = [orderLocation.lat - 0.02, orderLocation.lng - 0.02];
                    setStartPosition(simulatedStart);
                    setRoute([simulatedStart, currentPos]);
                }
            } else {
                setRoute([startPosition, currentPos]);
            }
        }
    }, [orderLocation]);

    return (
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Garis rute perjalanan */}
            {route.length > 1 && <Polyline positions={route} color="blue" />}

            {/* Marker titik awal */}
            {startPosition && (
                <Marker position={startPosition} icon={startIcon}>
                    <Popup>Titik Awal</Popup>
                </Marker>
            )}

            {/* Marker lokasi saat ini */}
            <Marker position={position} icon={currentIcon}>
                <Popup>Lokasi Saat Ini</Popup>
            </Marker>

            {/* Marker tujuan */}
            {route.length > 1 && (
                <Marker position={route[1]} icon={destinationIcon}>
                    <Popup>Tujuan</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default GPSMap;
