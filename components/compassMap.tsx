'use client'

import { useState, useEffect } from "react"
import { MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Badge } from "./ui/badge"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

interface CompassMapProps {
    qiblatReading: number
    compassReading: number
    lat: number
    lng: number
}

const CompassMap = ({ compassReading, qiblatReading, lat, lng }: CompassMapProps) => {
    const [position, setPosition] = useState<{ lat: number, lng: number }>({ lat, lng })

    // Update position when props change
    useEffect(() => {
        setPosition({ lat, lng });
    }, [lat, lng]);

    return (
        <div className="border border-gray-300 bg-white rounded-lg shadow-lg w-full p-4 flex flex-col items-center gap-4">
            <div className="w-full max-w-md flex flex-col items-center text-xs">
                <div className={`${compassReading == 0 ? 'text-muted-foreground' : ''}`}>Put your phone on a level surface, pointing North direction.</div>
                <div className={`${compassReading != 0 ? 'text-muted-foreground' : ''}`}><Dialog>
                <DialogTrigger><span className="underline mr-1">Calibrate</span></DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>How to Calibrate Your Compass</DialogTitle>
                        <DialogDescription>
                            Follow these steps to improve your compass accuracy.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-semibold">1</div>
                                <span>Move away from electronic devices and metal objects</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-semibold">2</div>
                                <span>Hold your phone and trace a figure-8 pattern in the air several times</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-semibold">3</div>
                                <span>Rotate your device in all three axes</span>
                            </div>
                        </div>

                        <div className="relative border rounded-lg p-4 mt-2">
                            <div className="flex justify-center items-center flex-col">
                                <div className="text-4xl mb-3">∞</div>
                                <div className="text-sm text-center text-gray-500">
                                    Figure-8 pattern is most effective for compass calibration
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose>
                            I Have Done This
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
  if your building or surrounding is not aligned to the map.</div>
                <div className={`${compassReading != 0 ? 'text-muted-foreground' : ''}`}>Your Qiblat is on the green line direction.</div>
            </div>

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
                            className="absolute w-0.5 h-32 bg-red-500"
                            style={{
                                transformOrigin: 'bottom center',
                                transform: `rotate(${compassReading}deg)`,
                                bottom: '50%',
                                left: 'calc(50% - 0.5px)'
                            }}
                        />
                        <div className="h-4 w-4 rounded-full bg-black absolute"></div>
                        <div
                            className="absolute w-0.5 h-32 bg-green-700"
                            style={{
                                transformOrigin: 'bottom center',
                                transform: `rotate(${qiblatReading}deg)`,
                                bottom: '50%',
                                left: 'calc(50% - 0.5px)'
                            }}
                        />
                        <div className="h-4 w-4 rounded-full bg-black absolute"></div>
                        {/* North indicator at the top of the map */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-[1001]">
                            <Badge variant={`${compassReading == 0 ? "destructive" : "default"}`} className="">North</Badge>
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    )
}

export default CompassMap