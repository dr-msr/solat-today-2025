'use client'

import { GetSolatResponses } from "@/app/api/getSolat/route";
import { CircleX, RefreshCcwIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { PuffLoader } from "react-spinners";
import { useGeolocation, useLocalStorage } from "react-use";
import { GeoLocationSensorState } from "react-use/lib/useGeolocation";

interface ZonIndicatorProps {
    updateJadualSolat  : (jadualSolat: GetSolatResponses | null) => void
    updateCurrentPosition : (position: {lat: number, lng: number} | null) => void
}

const ZonIndicator = ({ updateJadualSolat, updateCurrentPosition }: ZonIndicatorProps) => {
    const [savedLocation, updateLocation, clearLocation] = useLocalStorage('location')
    const location : GeoLocationSensorState = useGeolocation({
        enableHighAccuracy: true,
        maximumAge: 300000, // 5 minutes
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
    
    // Track the last time we made an API call
    const lastApiCallTimeRef = useRef<number>(0)
    // Track the last coordinates we used for an API call
    const lastCoordinatesRef = useRef<{lat: number, lng: number} | null>(null)
    // Cache duration in milliseconds (5 minutes)
    const CACHE_DURATION = 300000

    // Handle manual refresh requested by user
    const handleManualRefresh = () => {
        clearLocation()
        setCurrentLocation(null)
        setJadualSolat(null)
        setSolatError(null)
        setLocationLoading(true)
        updateJadualSolat(null)
        lastApiCallTimeRef.current = 0
        lastCoordinatesRef.current = null
    }

    // Process location updates
    useEffect(() => {
        const processLocation = () => {
            setLocationLoading(location.loading)
            
            // Handle error state
            if (location.error) {
                console.log(location.error)
                setLocationError(location.error.message)
                
                // Try to use saved location as fallback
                if (savedLocation !== undefined) {
                    const data = JSON.parse(savedLocation as string)
                    setCurrentLocation({
                        lat: data.lat,
                        lng: data.lng
                    })
                    updateCurrentPosition({
                        lat: data.lat,
                        lng: data.lng
                    })
                }
                return
            }

            // Handle loading state with saved location as fallback
            if (location.loading) {
                if (savedLocation !== undefined) {
                    const data = JSON.parse(savedLocation as string)
                    setCurrentLocation({
                        lat: data.lat,
                        lng: data.lng
                    })
                }
                return
            }

            // Handle success state
            if (location.latitude != null && location.longitude != null) {
                const newCoord = {
                    lat: location.latitude,
                    lng: location.longitude
                }
                
                // Check if we have a significant location change (more than 0.001 degrees, approximately 100 meters)
                const hasLocationChanged = !lastCoordinatesRef.current || 
                    Math.abs(newCoord.lat - lastCoordinatesRef.current.lat) > 0.001 || 
                    Math.abs(newCoord.lng - lastCoordinatesRef.current.lng) > 0.001
                
                // Check if the cache time has expired
                const now = Date.now()
                const cacheExpired = (now - lastApiCallTimeRef.current) > CACHE_DURATION
                
                // Update state and save to localStorage only if:
                // 1. We don't have a current location yet, or
                // 2. The location has significantly changed
                if (!currentLocation || hasLocationChanged) {
                    console.log('Location updated at ' + new Date())
                    const strCoord = JSON.stringify(newCoord)
                    updateLocation(strCoord)
                    setCurrentLocation(newCoord)
                    setLocationLoading(false)
                    setLocationError(null)
                    updateCurrentPosition(newCoord)
                    
                    // Only update lastCoordinatesRef when we actually change the location
                    lastCoordinatesRef.current = newCoord
                    
                    // If cache is expired or location changed significantly, mark that we should fetch new data
                    if (cacheExpired || hasLocationChanged) {
                        lastApiCallTimeRef.current = now
                    }
                }
            } else {
                setLocationError('Failed to get location')
            }
        }
        
        processLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location])

    // Fetch prayer times when currentLocation changes or on manual refresh
    useEffect(() => {
        const getSolat = async () => {
            if (!currentLocation) return;
            
            // Check if we already have data for this location and the cache is still valid
            const now = Date.now()
            const cacheExpired = (now - lastApiCallTimeRef.current) > CACHE_DURATION
            
            // Skip API call if cache is still valid and coordinates haven't changed significantly
            if (jadualSolat && !cacheExpired && lastCoordinatesRef.current &&
                Math.abs(currentLocation.lat - lastCoordinatesRef.current.lat) <= 0.001 &&
                Math.abs(currentLocation.lng - lastCoordinatesRef.current.lng) <= 0.001) {
                console.log('Using cached prayer times for', currentLocation)
                return
            }

            try {
                console.log('Fetching new prayer times at ' + new Date(), currentLocation)
                setSolatLoading(true)
                setSolatError(null)

                const res = await fetch(`/api/getSolat?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}`)

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.error)
                }

                const data: GetSolatResponses = await res.json()
                setJadualSolat(data)
                console.log('Prayer times retrieved:', data.zon)
                updateJadualSolat(data)
                
                // Update our tracking refs
                lastApiCallTimeRef.current = now
                lastCoordinatesRef.current = currentLocation
            } catch (error) {
                console.error('Error fetching prayer times:', error)
                setSolatError(error instanceof Error ? error.message : 'Unknown error occurred')
            } finally {
                setSolatLoading(false)
            }
        }

        if (currentLocation) {
            getSolat()
            updateCurrentPosition(currentLocation)

        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLocation])


    return (
        <div className="border border-gray-300 bg-white rounded-lg shadow-lg w-full p-2">
            <div className="w-full flex flex-row justify-between items-center">
                <div className="flex-grow">
                    {locationError ? locationError : 
                     solatError ? solatError : 
                     solatLoading ? 'Loading prayer times...' : 
                     jadualSolat ? jadualSolat.zon.district : 'Loading location...'}
                </div>
                <div className="flex flex-row gap-2">
                    {locationError ? <CircleX size={16} className="text-red-500" onClick={() => handleManualRefresh()} /> : locationLoading ? <PuffLoader size={16} /> : <RefreshCcwIcon size={16} className="text-gray-500 hover:text-gray-900 transition-colors" onClick={() => handleManualRefresh()} />
                    }
                </div>

            </div>
        </div>
    )
}

export default ZonIndicator