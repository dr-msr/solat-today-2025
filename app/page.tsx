'use client'

import ZonIndicator from "@/components/zonIndicator";
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
import MasjidList from "@/components/masjidList";
import { GetSolatResponses } from "./actions/getSolat";

export default function Home() {
  const [jadualSolat, updateJadualSolat] = useLocalStorage<GetSolatResponses | null>('jadualSolat', null)
  const [currentJadualSolat, setCurrentJadualSolat] = useState<GetSolatResponses | null>(null)
  const [timer, setTimer] = useState<string | null>(null)
  const handleUpdateJadualSolat = (jadualSolat: GetSolatResponses | null) => {
    setCurrentJadualSolat(jadualSolat)
    updateJadualSolat(jadualSolat)
  }
  
  const [compassReading, updateCompassReading] = useState<number | null>(0)
  const [currentPosition, updateCurrentPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)


  const sortedMasjid = [...(currentJadualSolat?.masjid || [])]
  .sort((a, b) => {
    // Handle undefined distance values
    if (a.distance === undefined) return 1; // Move undefined to the end
    if (b.distance === undefined) return -1; // Move undefined to the end
    
    // Convert to number and compare
    return parseFloat(a.distance) - parseFloat(b.distance);
  }
);



  useEffect(() => {
    if (jadualSolat != undefined) {
      setCurrentJadualSolat(jadualSolat)
      console.log("Jadual Solat Updated at " + new Date())
      console.log(jadualSolat)
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
            <TabsContent value="masjid">
              <MasjidList masjid={
                // Filter for unique no_daftar values while preserving sort order
                sortedMasjid.filter((item, index, self) => 
                  index === self.findIndex(t => t.no_daftar === item.no_daftar)
                ).slice(0, 5)
              } />
            </TabsContent>
            <TabsList className="w-full flex flex-row border border-gray-300 bg-white rounded-lg shadow-lg w-full items-center justify-evenly p-2">
              <TabsTrigger value="solat" className="w-full px-2">
                <div>Prayer <Badge>{timer}</Badge></div></TabsTrigger>
                { compassReading != null && (<TabsTrigger value="kiblat" className="w-full px-2">
                <div>{ (isAlignedWithQiblat({ bearing: currentJadualSolat.bearing, heading: compassReading! })) ? "Qiblat " : "Compass " }<Badge 
                  variant="destructive" 
                  className={cn(
                    isAlignedWithQiblat({ bearing: currentJadualSolat.bearing, heading: compassReading! }) ? "bg-green-600 hover:bg-green-700" : "bg-black"
                  )}
                >
                  {compassReading !== null ? `${compassReading}°` : null}
                </Badge></div>
              </TabsTrigger>)}
              {sortedMasjid.length > 0 && <TabsTrigger value="masjid" className="w-full px-2">Masjid <Badge>{sortedMasjid[0].distance ? parseFloat(sortedMasjid[0].distance).toFixed(2) : ""} km</Badge></TabsTrigger>}
            </TabsList>
            <CalibrateCompass updateReading={(reading : number) => updateCompassReading(reading)}  />

          </Tabs>
          


        }
      </main>
    </div>
  );
}
