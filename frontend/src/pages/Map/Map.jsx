import { useState, useEffect } from "react";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const defaultIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function LocationMarker({ location, setLocation }) {

    const [position, setPosition] = useState(null);

    const map = useMap();

    // Update marker and map when existing location arrives
    useEffect(() => {

        if (location) {

            const newPosition = [
                location.latitude,
                location.longitude
            ];

            setPosition(newPosition);

            map.setView(newPosition, 13);
        }

    }, [location, map]);


    useMapEvents({

        click(e) {

            const newLocation = {
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            };

            setPosition([
                e.latlng.lat,
                e.latlng.lng
            ]);

            setLocation(newLocation);
        }

    });

    return position ? (
        <Marker position={position} icon={defaultIcon} />
    ) : null;
}


export default function MapComponent({
    height = "400px",
    width = "100%",
    location,
    setLocation
}) {

    const defaultPosition = [22.7196, 75.8577];

    return (

        <MapContainer
            center={defaultPosition}
            zoom={13}
            style={{
                height: height,
                width: width
            }}
        >

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
            />

            <LocationMarker
                location={location}
                setLocation={setLocation}
            />

        </MapContainer>

    );
}