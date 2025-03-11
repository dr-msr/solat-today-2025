'use client'

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/compassMap"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Loading map...</div>
}) as unknown as typeof import("@/components/compassMap").default;

export default Map