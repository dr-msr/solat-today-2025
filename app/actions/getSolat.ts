'use server';

import { getZonJakim } from '@/lib/solat/getZonJakim';
import bearing from '@/lib/solat/bearing.json';

const JAKIM_MOSQUE = 'https://www.e-solat.gov.my/index.php?r=esolatApi/nearestMosque&dist=20';
const API_URL = 'https://api.waktusolat.app/v2/solat/';

export type bearingQiblat = {
  zone: string;
  bearing: string;
  bearing_degree: number;
};

// Success response type
export type GetSolatResponses = {
  zon: ZonJakim;
  month: string;
  updatedAt: Date;
  bearing: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  masjid: any; // TODO: Type this properly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prayerTimes: any; // TODO: Type this properly
};

// Error response type
export type GetSolatError = {
  error: string;
};

export type ZonJakim = {
  code: string;
  state: string;
  district: string;
};

export async function getSolatData(latitude: string, longitude: string): Promise<GetSolatResponses | GetSolatError> {
  try {
    // Validate parameters
    if (!latitude || !longitude) {
      console.error('Missing required parameters');
      return { error: 'Missing required parameters: latitude and longitude' };
    }

    // Convert string parameters to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Validate parameter values
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid lat/lng parameters:', { lat, lng });
      return { error: 'Invalid location coordinates' };
    }

    // Get the prayer times from an external API or calculate them
    const zon = await getZonJakim(lat, lng);
    if (!zon) {
      console.error('Zon JAKIM not found for coordinates:', { lat, lng });
      return { error: 'Solat.Today is only available in Malaysia.' };
    }

    // Get prayer times
    const api_url = API_URL + zon.code;
    let result;
    try {
      result = await fetch(api_url);
      if (!result.ok) {
        console.error('Failed to fetch prayer times from API:', { statusCode: result.status });
        return { error: 'Unable to retrieve prayer times' };
      }
    } catch (apiError) {
      console.error('API request failed:', apiError);
      return { error: 'Connection error when retrieving prayer times' };
    }
    
    const timetable = await result.json();
    const prayerTimes = timetable.prayers;

    // Get Qibla bearing
    const bearingQ = bearing.find(bearing => bearing.zone === zon.code);
    const bearingDegree = bearingQ?.bearing_degree || 0;

    // Get nearby mosques
    let mosque = { locationData: [] };
    try {
      const api_url3 = JAKIM_MOSQUE + '&lat=' + lat + '&long=' + lng;
      const result3 = await fetch(api_url3);
      
      if (result3.ok) {
        mosque = await result3.json();
      } else {
        console.error('Failed to fetch nearby mosques:', { statusCode: result3.status });
        // Continue anyway with empty mosque data
      }
    } catch (mosqueError) {
      console.error('Error fetching mosque data:', mosqueError);
      // Continue with empty mosque data
    }
    // Return successful response
    return {
      zon: zon,
      month: timetable.month,
      updatedAt: new Date(timetable.last_updated),
      bearing: bearingDegree,
      masjid: mosque.locationData || [],
      prayerTimes: prayerTimes
    };
    
  } catch (error) {
    console.error('Unexpected error in getSolatData:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unexpected error occurred while retrieving prayer data'
    };
  }
}
