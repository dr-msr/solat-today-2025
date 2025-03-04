import { getZonJakim } from '@/lib/solat/getZonJakim';
import { NextRequest, NextResponse } from 'next/server';
import bearing from '@/lib/solat/bearing.json'; 

const JAKIM_MOSQUE = 'https://www.e-solat.gov.my/index.php?r=esolatApi/nearestMosque&dist=3'
const API_URL = 'https://api.waktusolat.app/v2/solat/';

export type bearingQiblat = {
  zone : string,
  bearing : string,
  bearing_degree : number
}

export type GetSolatResponses = {
    zon : ZonJakim,
    month : string,
    updatedAt : Date,
    bearing : number,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    masjid : any,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    prayerTimes : any
}

export type ZonJakim = {
    code : string,
    state : string,
    district : string
}

/**
 * API route to get prayer times based on coordinates
 * @param req NextRequest object
 * @returns NextResponse with prayer times data
 */
export async function GET(req: NextRequest) {
  try {
    // Get the URL object from the request
    const url = new URL(req.url);
    
    // Extract parameters
    const latitude = url.searchParams.get('latitude');
    const longitude = url.searchParams.get('longitude');
    
    // Validate parameters
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required parameters: latitude and longitude' },
        { status: 400 }
      );
    }
    
    // Convert string parameters to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Validate parameter values
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid parameter values' },
        { status: 400 }
      );
    }
    
    // Get the prayer times from an external API or calculate them
    const zon = await getZonJakim(lat, lng);
    if (!zon) {
      return NextResponse.json(
        { error: 'Zon JAKIM not found. Maybe you are not in Malaysia?' },
        { status: 500 }
      );
    }

    const api_url = API_URL + zon.code;
    const result = await fetch(api_url);
    if (!result.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve prayer times' },
        { status: 500 }
      );
    }
    const timetable = await result.json();
    const prayerTimes = timetable.prayers;

    const bearingQ  = bearing.find(bearing => bearing.zone === zon.code);


    const api_url3 = JAKIM_MOSQUE + '&lat=' + lat + '&long=' + lng;

    const result3 = await fetch(api_url3);
    if (!result3.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve JAKIM mosque' },
        { status: 500 }
      );
    }
    const mosque = await result3.json();

    const output : GetSolatResponses = {
        zon : zon,
        month : timetable.month,
        updatedAt : new Date(timetable.last_updated),
        bearing : bearingQ?.bearing_degree || 0,
        masjid : mosque.locationData,
        prayerTimes : prayerTimes
    }

    
    // Otherwise return all prayer times
    return NextResponse.json(output);
    
  } catch (error) {
    console.error('Error getting prayer times:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve prayer times' },
      { status: 500 }
    );
  }
}
