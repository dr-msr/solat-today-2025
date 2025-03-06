'use client'

import ZonIndicator from "@/components/zonIndicator";
import { GetSolatResponses } from "./api/getSolat/route";
import SolatPanel from "@/components/solatPanel";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "react-use";
import { isAlignedWithQiblat } from "@/lib/heading";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CalibrateCompass from "@/components/compassAccuracy";
import Header from "@/components/header";
import Map from "@/components/compassMap.client";

export default function Home() {
  const [jadualSolat, updateJadualSolat] = useLocalStorage<GetSolatResponses | null>('jadualSolat', null)
  const [currentJadualSolat, setCurrentJadualSolat] = useState<GetSolatResponses | null>(null)
  const [timer, setTimer] = useState<string | null>(null)
  const handleUpdateJadualSolat = (jadualSolat: GetSolatResponses | null) => {
    setCurrentJadualSolat(jadualSolat)
    updateJadualSolat(jadualSolat)
  }
  
  const [compassReading, updateCompassReading] = useState<number | null>(null)
  const [currentPosition, updateCurrentPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)






  useEffect(() => {
    if (jadualSolat != undefined) {
      setCurrentJadualSolat(jadualSolat)
      console.log("Jadual Solat Updated at " + new Date())
    }
  }, [jadualSolat])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <Header />      <main className="flex flex-col gap-2 items-center flex-1 px-4 sm:px-20 text-center z-10 pt-8 sm:pt-20">
        <div className="w-full min-w-sm flex flex-col items-center p-4">
          <h1 className="text-3xl sm:text-5xl font-bold relative">Solat Today</h1>
        </div>
        <ZonIndicator updateJadualSolat={(jadualSolat) => handleUpdateJadualSolat(jadualSolat)} updateCurrentPosition={(position) => updateCurrentPosition(position)} />
        {currentJadualSolat != null &&
          <Tabs defaultValue="solat" className="w-full">

            <TabsContent value="solat">
              <section className="border border-gray-300 bg-white rounded-lg shadow-lg w-full hover:shadow-2xl transition">

                <SolatPanel updateTimer={setTimer}  jadualSolat={currentJadualSolat} />
              </section>

            </TabsContent>
            <TabsContent value="kiblat" className="w-full">
                {(compassReading != null && currentPosition != null) && (
                  <Map compassReading={compassReading} lat={currentPosition.lat} lng={currentPosition.lng} qiblatReading={currentJadualSolat.bearing} />
                )}
            </TabsContent>
            <TabsContent value="masjid">Coming Soon</TabsContent>
            <TabsList className="w-full flex flex-row border border-gray-300 bg-white rounded-lg shadow-lg w-full items-center justify-evenly p-2">
              <TabsTrigger value="solat" className="w-full px-2">
                <div>Current Prayer <Badge>{timer}</Badge></div></TabsTrigger>
                { compassReading != null && (<TabsTrigger value="kiblat" className="w-full px-2">
                <div>{ (isAlignedWithQiblat({ bearing: currentJadualSolat.bearing, heading: compassReading! })) ? "Qiblat " : "Compass " }<Badge 
                  variant="destructive" 
                  className={cn(
                    isAlignedWithQiblat({ bearing: currentJadualSolat.bearing, heading: compassReading! }) ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  )}
                >
                  {compassReading !== null ? `${compassReading}°` : null}
                </Badge></div>
              </TabsTrigger>)}
              <TabsTrigger value="masjid" className="w-full px-2">Mosques</TabsTrigger>
            </TabsList>
            <CalibrateCompass updateReading={(reading : number) => updateCompassReading(reading)}  />

          </Tabs>
          


        }
      </main>
    </div>
  );
}
