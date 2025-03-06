'use client'

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/compassMap"), { 
  ssr: false,
});

export default Map