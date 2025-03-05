'use client'

import ZonIndicator from "@/components/zonIndicator";
import { GetSolatResponses } from "./api/getSolat/route";
import SolatPanel from "@/components/solatPanel";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "react-use";
import useDeviceOrientation from "@/lib/heading";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [jadualSolat, updateJadualSolat] = useLocalStorage<GetSolatResponses | null>('jadualSolat', null)
  const [currentJadualSolat, setCurrentJadualSolat] = useState<GetSolatResponses | null>(null)
  const { 
    orientation, 
    isSupported, 
    isPermissionGranted, 
    requestPermission, 
    secureOriginError,
    isMobile,
    error 
  } = useDeviceOrientation()
  const [permissionRequested, setPermissionRequested] = useState(false)

  const handleUpdateJadualSolat = (jadualSolat: GetSolatResponses | null) => {
    setCurrentJadualSolat(jadualSolat)
    updateJadualSolat(jadualSolat)
  }

  // Function to handle Qiblat permission request
  const handleQiblatPermission = async () => {
    if (!isSupported) return;
    
    setPermissionRequested(true);
    try {
      if (typeof requestPermission === 'function') {
        await requestPermission();
      }
    } catch (err) {
      console.error("Error requesting orientation permission:", err);
    }
  };

  // Get formatted compass heading
  const getCompassHeading = () => {
    if (!isSupported || !orientation.alpha) return null;
    return Math.round(orientation.alpha);
  };

  useEffect(() => {
    if (jadualSolat != undefined) {
      setCurrentJadualSolat(jadualSolat)
      console.log("Jadual Solat Updated at " + new Date())
    }
  }, [jadualSolat])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <main className="flex flex-col gap-2 items-center flex-1 px-4 sm:px-20 text-center z-10 pt-8 sm:pt-20">
        <div className="w-full min-w-sm flex flex-col items-center p-4">
          <h1 className="text-3xl sm:text-5xl font-bold relative">Solat Today</h1>
        </div>
        <ZonIndicator updateJadualSolat={(jadualSolat) => handleUpdateJadualSolat(jadualSolat)} />

          {currentJadualSolat != null && 
          <Tabs defaultValue="solat" className="w-full">

          <TabsContent value="solat">
          <section className="border border-gray-300 bg-white rounded-lg shadow-lg w-full hover:shadow-2xl transition">

            <SolatPanel jadualSolat={currentJadualSolat} />
            </section>

          </TabsContent>
          <TabsContent value="kiblat" className="flex flex-col justify-center items-center">
        <div className="p-4 mt-4 text-center">
          {secureOriginError && (
            <div className="text-red-500 p-4 border border-red-300 rounded-md bg-red-50 flex flex-col items-center">
              <AlertCircle className="mb-2" />
              <h3 className="font-bold">Secure Origin Required</h3>
              <p className="mb-2">Device orientation requires a secure context (HTTPS).</p>
              
              {isMobile && (
                <div className="text-left mt-2 text-sm">
                  <p className="font-semibold">To use this feature on mobile:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Deploy this app to an HTTPS domain</li>
                    <li>Or add the site to your home screen first</li>
                    <li>Or use a desktop browser in development</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {!isSupported && !secureOriginError && (
            <div className="text-red-500">
              Device orientation is not supported on your device.
            </div>
          )}
          
          {isSupported && isPermissionGranted === false && !secureOriginError && (
            <div className="text-center">
              <p className="mb-2">Permission to access device orientation is required for Qiblat direction.</p>
              <Button onClick={handleQiblatPermission} className="mt-2">
                Grant Permission
              </Button>
            </div>
          )}
          
          {isSupported && isPermissionGranted === null && permissionRequested && !secureOriginError && (
            <div className="text-amber-500">
              Waiting for permission response...
            </div>
          )}
          
          {isSupported && isPermissionGranted === true && getCompassHeading() === null && !secureOriginError && (
            <div className="text-amber-500">
              Waiting for orientation data...
              <p className="text-sm mt-2">Try moving your device around to activate the compass.</p>
            </div>
          )}
          
          {isSupported && isPermissionGranted === true && getCompassHeading() !== null && !secureOriginError && (
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold mb-2">Current Heading: {getCompassHeading()}°</div>
              <div className="relative w-64 h-64 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <div 
                  className="absolute w-1 h-20 bg-red-500" 
                  style={{ 
                    transformOrigin: 'bottom center',
                    transform: `rotate(${getCompassHeading()}deg)`,
                    bottom: '50%',
                    left: 'calc(50% - 0.5px)'
                  }}
                />
                <div className="text-xs">N</div>
              </div>
            </div>
          )}
          
          {error && !secureOriginError && (
            <div className="text-red-500 mt-4">
              Error: {error.message}
            </div>
          )}
        </div>
      </TabsContent>
          <TabsContent value="masjid">Coming Soon</TabsContent>
          <TabsList className="border border-gray-300 bg-white rounded-lg shadow-lg w-full items-center justify-center p-2">
            <TabsTrigger value="solat" className="px-2">Prayer Times</TabsTrigger>
            <TabsTrigger value="kiblat" className="px-2" onClick={handleQiblatPermission}>
              Qiblat {getCompassHeading() !== null ? `: ${getCompassHeading()}°` : ''}
            </TabsTrigger>
            <TabsTrigger value="masjid" className="px-2">Mosques</TabsTrigger>
          </TabsList>
        </Tabs>
        
            
          }
      </main>
    </div>
  );
}
