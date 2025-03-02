import { getZonJakim } from '@/lib/solat/getZonJakim';
import { NextRequest, NextResponse } from 'next/server';
import { stringify } from 'querystring';

const JAKIM_URL = 'https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=week&zone=';
const JAKIM_MOSQUE = 'https://www.e-solat.gov.my/index.php?r=esolatApi/nearestMosque&dist=3'
const API_URL = 'https://api.waktusolat.app/v2/solat/';

export type GetSolatResponses = {
    zon : ZonJakim,
    month : string,
    updatedAt : Date,
    bearing : string,
    masjid : any,
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
    var timetable = await result.json();
    var prayerTimes = timetable.prayers;

    const api_url2 = JAKIM_URL + zon.code;
    const result2 = await fetch(api_url2);
    if (!result2.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve JAKIM times' },
        { status: 500 }
      );
    }
    var timetable2 = await result2.json();

    const api_url3 = JAKIM_MOSQUE + '&lat=' + lat + '&long=' + lng;

    const result3 = await fetch(api_url3);
    if (!result3.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve JAKIM mosque' },
        { status: 500 }
      );
    }
    var mosque = await result3.json();
    console.log(mosque);

    const output : GetSolatResponses = {
        zon : zon,
        month : timetable.month,
        updatedAt : new Date(timetable.last_updated),
        bearing : timetable2.bearing,
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
