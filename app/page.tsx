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

export default function Home() {
  const [jadualSolat, updateJadualSolat] = useLocalStorage<GetSolatResponses | null>('jadualSolat', null)
  const [currentJadualSolat, setCurrentJadualSolat] = useState<GetSolatResponses | null>(null)
  const [timer, setTimer] = useState<string | null>(null)
  const handleUpdateJadualSolat = (jadualSolat: GetSolatResponses | null) => {
    setCurrentJadualSolat(jadualSolat)
    updateJadualSolat(jadualSolat)
  }
  const [compassReading, updateCompassReading] = useState<number | null>(null)







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

                <SolatPanel updateTimer={setTimer}  jadualSolat={currentJadualSolat} />
              </section>

            </TabsContent>
            <TabsContent value="kiblat" className="flex flex-col justify-center items-center">
              <div className="p-4 mt-4 text-center">










                {compassReading != null && (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold mb-2">Current Heading: {compassReading}°</div>
                    <div className="relative w-64 h-64 border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <div
                        className="absolute w-1 h-20 bg-red-500"
                        style={{
                          transformOrigin: 'bottom center',
                          transform: `rotate(${compassReading}deg)`,
                          bottom: '50%',
                          left: 'calc(50% - 0.5px)'
                        }}
                      />
                      <div className="text-xs">N</div>
                    </div>
                  </div>
                )}

              </div>
            </TabsContent>
            <TabsContent value="masjid">Coming Soon</TabsContent>
            <TabsList className="border border-gray-300 bg-white rounded-lg shadow-lg w-full items-center justify-center p-2">
              <TabsTrigger value="solat" className="px-2">
                <div>Current Prayer <Badge>{timer}</Badge></div></TabsTrigger>
              <TabsTrigger value="kiblat" className="px-2">
                <div>Qiblat <Badge 
                  variant="destructive" 
                  className={cn(
                    isAlignedWithQiblat({ bearing: currentJadualSolat.bearing, heading: compassReading! }) ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  )}
                >
                  {compassReading !== null ? `${compassReading}°` : '-'}
                </Badge></div>
              </TabsTrigger>
              <TabsTrigger value="masjid" className="px-2">Mosques</TabsTrigger>
            </TabsList>
            <CalibrateCompass updateReading={(reading : number) => updateCompassReading(reading)}  />

          </Tabs>
          


        }
      </main>
    </div>
  );
}
