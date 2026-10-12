// We add an "opaque type" to a value to communicate that it has been validated.

import { type NrwApiResponse } from '#utils/restRequest';

import type NrwLngLat from './NrwLngLat';

// https://evertpot.com/opaque-ts-types/
export type UrlParameter = string | null | undefined;

declare const validZoom: unique symbol;

export type Zoom = number & {
    [validZoom]: true;
};

declare const validLatitude: unique symbol;

export type Latitude = number & {
    [validLatitude]: true;
};

declare const validLongitude: unique symbol;

export type Longitude = number & {
    [validLongitude]: true;
};

declare const validCountryCode: unique symbol;

export type CountryCodeIso3 = string & {
    [validCountryCode]: true;
};

declare const validAdminLevel: unique symbol;

export type AdminLevel = number & {
    [validAdminLevel]: true;
};

declare const validPlaceCode: unique symbol;

export type PlaceCode = string & {
    [validPlaceCode]: true;
};

export type NrwAdminAreaFeatureCollection = NrwApiResponse<'/admin-areas'>;
export type NrwAdminAreaProperties = NrwAdminAreaFeatureCollection['features'][number]['properties'];

// The validated properties of an /admin-areas feature, narrowed from the API type.
// Mapbox returns the rendered feature properties untyped, so they are parsed back into this.
export interface AdminAreaProperties {
    adminLevel: AdminLevel;
    placeCode: PlaceCode;
    name: NrwAdminAreaProperties['nameEn'];
}

// eslint-disable-next-line max-len
export type MapViewChangeHandler = (newZoom: Zoom, newLatitude: Latitude, newLongitude: Longitude) => void;

// Lon/lat bounds as two bounding box corners, i.e. the southwest and northeast corners.
// The order doesn't matter for Mapbox.
export type LongitudeLatitudeBounds = [NrwLngLat, NrwLngLat];

export type MapView = {
    zoom: Zoom;
    center: NrwLngLat;
    fitBounds?: LongitudeLatitudeBounds;
};

export type NrwEvent = NrwApiResponse<'/events'>[number];
export type NrwEventHazardType = NrwEvent['hazardType'];
export type NrwEventIdChangeHandler = (eventId: NrwEvent['eventId'] | undefined) => void;
export type NrwEventSelectHandler = (
    eventId?: NrwEvent['eventId'],
    hazardType?: NrwEventHazardType,
) => void;
export type NrwExposedAdminArea = NrwEvent['exposedAdminAreas'][string][number];

export type NrwCountry = NrwApiResponse<'/countries'>[number];
export type NrwAdminLevelLabels = NonNullable<NrwCountry['adminLevelLabels']>;
export type PlaceCodeChangeHandler = (placeCode: PlaceCode | undefined) => void;
export type AdminAreaDrillDownHandler = (adminArea: AdminAreaProperties) => void;
export type AdminLevelDrillHandler = (adminLevel: AdminLevel) => void;

export type NrwStaticLayer = NrwApiResponse<'/layers'>[number];
export type NrwEventLayer = NrwEvent['availableLayers'][number];
export type NrwLayer = NrwStaticLayer | NrwEventLayer;
export type NrwLayerName = NrwLayer['name'];
export type VisibleLayersChangeHandler = (layerNames: NrwLayerName[]) => void;
export type LayerToggleHandler = (layerName: NrwLayerName) => void;

export enum NrwLegendType {
    Gradient = 'gradient',
}

export type NrwLegendItem = {
    type: NrwLegendType.Gradient;
    layerName: NrwLayerName;
    label: NrwLayer['label'];
    colors: readonly string[];
};
