'use client'

import { GetSolatResponses, ZonJakim } from "@/app/api/getSolat/route";
import { CircleX, RefreshCcwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useGeolocation, useLocalStorage } from "react-use";
import { Button } from "./ui/button";
import { GeoLocationSensorState } from "react-use/lib/useGeolocation";
import { PuffLoader } from "react-spinners";

interface ZonIndicatorProps {
    updateJadualSolat  : (jadualSolat: GetSolatResponses | null) => void
}


const ZonIndicator = ({ updateJadualSolat }: ZonIndicatorProps) => {
    const [savedLocation, updateLocation, clearLocation] = useLocalStorage('location')
    const location: GeoLocationSensorState = useGeolocation({
        enableHighAccuracy: true,
    })
    const [currentLocation, setCurrentLocation] = useState<{
        lat: number,
        lng: number
    } | null>(null)
    const [locationLoading, setLocationLoading] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [jadualSolat, setJadualSolat] = useState<GetSolatResponses | null>(null)
    const [solatLoading, setSolatLoading] = useState(false)
    const [solatError, setSolatError] = useState<string | null>(null)

    const handleUpdateLocation = (refresh?: boolean) => {
        if (refresh) {
            clearLocation()
            setCurrentLocation(null)
            setJadualSolat(null)
            setSolatError(null)
            setLocationLoading(true)
        }

        if (location.loading) {
            setLocationLoading(true)
            if (savedLocation != undefined) {
                const data = JSON.parse(savedLocation as string)
                setCurrentLocation({
                    lat: data.lat,
                    lng: data.lng
                })
            }
        } else if (location.error) {
            console.log(location.error)
            setLocationError(location.error.message)
            if (savedLocation != undefined) {
                const data = JSON.parse(savedLocation as string)
                setCurrentLocation({
                    lat: data.lat,
                    lng: data.lng
                })
            }

        } else {
            if (location.latitude == null || location.longitude == null) {
                setLocationError('Failed to get location')
                return
            }
            const coord = {
                lat: location.latitude,
                lng: location.longitude
            }
            const strCoord = JSON.stringify(coord)
            updateLocation(strCoord)
            setCurrentLocation(coord)
            setLocationLoading(false)   
            setLocationError(null)
        }
    }


    useEffect(() => {
        handleUpdateLocation()
    }, [location])

    useEffect(() => {
        const getSolat = async () => {
            if (!currentLocation) return;

            try {
                setSolatLoading(true)
                setSolatError(null)

                const res = await fetch(`/api/getSolat?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}`)

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.error || 'Failed to fetch prayer times')
                }

                const data: GetSolatResponses = await res.json()
                setJadualSolat(data)
                console.log('Prayer times retrieved:', data.zon)
                updateJadualSolat(data)
            } catch (error) {
                console.error('Error fetching prayer times:', error)
                setSolatError(error instanceof Error ? error.message : 'Unknown error occurred')
            } finally {
                setSolatLoading(false)
            }
        }

        if (currentLocation) {
            getSolat()
        }
    }, [currentLocation])



    return (
        <div className="border border-gray-300 bg-white rounded-lg shadow-lg w-full p-2">
            <div className="w-full flex flex-row justify-between items-center">
                <div className="flex-grow">
                    {locationError ? locationError : jadualSolat ? jadualSolat.zon.district : 'Loading...'}
                </div>
                <div className="flex flex-row gap-2">
                    {locationError ? <CircleX size={16} className="text-red-500" onClick={() => handleUpdateLocation(true)} /> : locationLoading ? <PuffLoader size={16} /> : <RefreshCcwIcon size={16} className="text-gray-500 hover:text-gray-900 transition-colors" onClick={() => handleUpdateLocation(true)} />
                    }
                </div>

            </div>
        </div>
    )
}

export default ZonIndicator