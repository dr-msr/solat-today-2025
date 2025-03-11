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

export type ZonJakim = {
  code: string;
  state: string;
  district: string;
};

export async function getSolatData(latitude: string, longitude: string): Promise<GetSolatResponses> {
  try {
    // Validate parameters
    if (!latitude || !longitude) {
      throw new Error('Missing required parameters: latitude and longitude');
    }

    // Convert string parameters to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Validate parameter values
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid parameter values');
    }

    // Get the prayer times from an external API or calculate them
    const zon = await getZonJakim(lat, lng);
    if (!zon) {
      throw new Error('Zon JAKIM not found. Maybe you are not in Malaysia?');
    }

    // Get prayer times
    const api_url = API_URL + zon.code;
    const result = await fetch(api_url);
    if (!result.ok) {
      throw new Error('Failed to retrieve prayer times');
    }
    const timetable = await result.json();
    const prayerTimes = timetable.prayers;

    // Get Qibla bearing
    const bearingQ = bearing.find(bearing => bearing.zone === zon.code);

    // Get nearby mosques
    const api_url3 = JAKIM_MOSQUE + '&lat=' + lat + '&long=' + lng;
    const result3 = await fetch(api_url3);
    if (!result3.ok) {
      throw new Error('Failed to retrieve JAKIM mosque');
    }
    const mosque = await result3.json();

    return {
      zon: zon,
      month: timetable.month,
      updatedAt: new Date(timetable.last_updated),
      bearing: bearingQ?.bearing_degree || 0,
      masjid: mosque.locationData,
      prayerTimes: prayerTimes
    };
  } catch (error) {
    console.error('Error getting prayer times:', error);
    throw error;
  }
}
