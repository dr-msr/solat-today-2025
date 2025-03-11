'use client'

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

interface MasjidMapProps {
    lat: number | string
    lng: number | string
    name: string
}

const MasjidMap = ({ lat, lng, name }: MasjidMapProps) => {
    // Convert string coordinates to numbers if needed
    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat
    const longitude = typeof lng === 'string' ? parseFloat(lng) : lng
    
    return (
        <div style={{ height: "300px", width: "100%", position: "relative" }}>
            <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[latitude, longitude]}>
                    <Popup>
                        {name}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}

export default MasjidMap
