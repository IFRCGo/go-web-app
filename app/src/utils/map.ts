import { isDefined } from '@togglecorp/fujs';
import type {
    Map,
    NavigationControl,
} from 'mapbox-gl';

import { type Country } from '#hooks/domain/useCountryRaw';
import { getGeoJsonBounds } from '#utils/geo';

export const defaultMapStyle = 'mapbox://styles/go-ifrc/ckrfe16ru4c8718phmckdfjh0';
export const localUnitMapStyle = 'mapbox://styles/go-ifrc/clvvgugzh00x501pc1n00b8cz';

type NavControlOptions = NonNullable<ConstructorParameters<typeof NavigationControl>[0]>;
export const defaultNavControlOptions: NavControlOptions = {
    showCompass: false,
};

type ControlPosition = NonNullable<Parameters<Map['addControl']>[1]>;
export const defaultNavControlPosition: ControlPosition = 'top-right';

export const defaultMapOptions: Omit<mapboxgl.MapboxOptions, 'style' | 'container'> = {
    logoPosition: 'bottom-left' as const,
    zoom: 1.5,
    minZoom: 1,
    maxZoom: 18,
    scrollZoom: false,
    pitchWithRotate: false,
    dragRotate: false,
    renderWorldCopies: true,
    attributionControl: false,
    preserveDrawingBuffer: true,
    // interactive: false,
};

export function getCountryListBoundingBox(countryList: Country[]) {
    if (countryList.length < 1) {
        return undefined;
    }

    const countryWithBbox = countryList.filter((country) => isDefined(country.bbox));

    if (countryWithBbox.length < 1) {
        return undefined;
    }
    const collection = {
        type: 'FeatureCollection' as const,
        features: countryWithBbox.map((country) => ({
            type: 'Feature' as const,
            geometry: country.bbox as unknown as GeoJSON.Geometry,
            properties: null,
        })),
    } as GeoJSON.FeatureCollection;

    return getGeoJsonBounds(collection);
}

type Bbox = Record<string, unknown> | GeoJSON.Geometry;

export function getBboxListBoundingBox(bboxList: (Bbox | null | undefined)[] | undefined) {
    const definedBboxList = bboxList?.filter(isDefined) ?? [];

    if (definedBboxList.length < 1) {
        return undefined;
    }

    const collection: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: definedBboxList.map((bbox) => ({
            type: 'Feature' as const,
            geometry: bbox as GeoJSON.Geometry,
            properties: null,
        })),
    };

    return getGeoJsonBounds(collection);
}

const ADMIN_2_TILESET_OWNER = 'go-ifrc';

function getTileset(sourceLayer: string) {
    return {
        sourceLayer,
        url: `mapbox://${ADMIN_2_TILESET_OWNER}.${sourceLayer}`,
    };
}

export function getAdmin2Tileset(iso3: string) {
    return getTileset(`go-admin2-${iso3}-staging`);
}

export function getAdmin2CentroidTileset(iso3: string) {
    return getTileset(`go-admin2-${iso3}-centroids`);
}
