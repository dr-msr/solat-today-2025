import PolygonLookup from "polygon-lookup";
import ZonJakimJson from "./zonJakim.json";
import { FeatureCollection } from "geojson";

export type ZonJakim = {
    code : string,
    state : string,
    district : string
}

export async function getZonJakim(latitude: number, longitude: number): Promise<ZonJakim | null> {
    const search = new PolygonLookup(ZonJakimJson as FeatureCollection)
    const result = search.search(longitude, latitude)
    if (result && result.properties) {
        return {
            code : result.properties.jakim_code,
            state : result.properties.state,
            district : result.properties.name
        };
    } else {
        return null
    }

    
}