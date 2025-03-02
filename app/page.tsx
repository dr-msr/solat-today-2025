'use client'

import ZonIndicator from "@/components/zonIndicator";
import { GetSolatResponses } from "./api/getSolat/route";
import { useLocalStorage } from "react-use";
import SolatPanel from "@/components/solatPanel";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [jadualSolat, updateJadualSolat, clearJadualSolat] = useLocalStorage<GetSolatResponses | null>('jadualSolat', null)
  const [currentJadualSolat, setCurrentJadualSolat] = useState<GetSolatResponses | null>(null)

  const handleUpdateJadualSolat = (jadualSolat: GetSolatResponses | null) => {
    setCurrentJadualSolat(jadualSolat)
    updateJadualSolat(jadualSolat)
    console.log("Jadual Solat Updated")
  }

  useEffect(() => {
    if (jadualSolat != undefined) {
      setCurrentJadualSolat(jadualSolat)
      console.log("Jadual Solat Updated", jadualSolat)
    }
  }, [])

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
          <TabsContent value="kiblat">Coming Soon</TabsContent>
          <TabsContent value="masjid">Coming Soon</TabsContent>
          <TabsList className="border border-gray-300 bg-white rounded-lg shadow-lg w-full items-center justify-center p-2">
            <TabsTrigger value="solat" className="px-2">Prayer Times</TabsTrigger>
            <TabsTrigger value="kiblat" className="px-2">Qiblat</TabsTrigger>
            <TabsTrigger value="masjid" className="px-2">Mosques</TabsTrigger>
          </TabsList>
        </Tabs>
        
            
          }
      </main>
    </div>
  );
}
