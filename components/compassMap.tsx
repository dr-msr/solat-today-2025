'use client'

import { useState, useEffect } from "react"
import { MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

interface CompassMapProps {
    compassReading: number
    lat: number
    lng: number
}

const CompassMap = ({ compassReading, lat, lng }: CompassMapProps) => {
    const [position, setPosition] = useState<{ lat: number, lng: number }>({ lat, lng })

    // Update position when props change
    useEffect(() => {
        setPosition({ lat, lng });
    }, [lat, lng]);

    return (
        <div className="border border-gray-300 bg-white rounded-lg shadow-lg w-full p-4 flex flex-col items-center gap-4">
            <div style={{ height: "400px", width: "100%", position: "relative" }}>
                <MapContainer
                    dragging={false}
                    center={position}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </MapContainer>

                {/* Compass overlay */}
{/* Compass overlay */}
<div className="compass-overlay">
  <div className="relative w-64 h-64 border-2 border-white rounded-full flex items-center justify-center bg-white/30 shadow-lg">
    <div
      className="absolute w-0.5 h-30 bg-black"
      style={{
        transformOrigin: 'bottom center',
        transform: `rotate(-${compassReading}deg)`,
        bottom: '50%',
        left: 'calc(50% - 0.5px)'
      }}
    />
    <div className="h-4 w-4 rounded-full bg-black absolute"></div>
  </div>
</div>
            </div>
        </div>
    )
}

export default CompassMap