// Data types and structures use for the Nrw Map components

import type {
    LayerSpecification,
    SourceSpecification,
} from 'mapbox-gl-v3';

import { type LayerDto } from './shared-dtos';
import type { AlertClass } from './shared-enums';

// A zoom/center pair describing the current map view
export interface MapViewParameters {
    zoom: number;
    center: {
        lon: number;
        lat: number;
    };
}

// A Mapbox layer set with the data source and its render layer.
// Mapbox keeps the data source and render layer as separate objects.
export interface NrwMapboxLayer {
    sourceId: string;
    renderLayerId: string;
    source: SourceSpecification;
    layer: LayerSpecification;
}

// An added map layer tracked by its layer id and draw order.
// Mapbox uses an ordered list to determine draw order.
export interface OrderedMapLayer {
    renderLayerId: string;
    drawOrder: number;
}

// Functions exposed by the map component so the data loader can manage layers.
export interface MapLayerFunctions {
    // Add a prepared layer (source + layer) to the map, ordered by the layer details
    addLayer: (layer: NrwMapboxLayer, layerInfo: LayerDto) => void;
    // Show or hide a layer that was previously added to the map
    setLayerVisibility: (layer: NrwMapboxLayer, visible: boolean) => void;
}

// Country-level non-event data
// This is a work in progress still and will either have more data added to it,
// or merged into some other source.
export interface CountryMapData {
  // Available map layers for the country that can be added
  availableLayers: LayerDto[];

  // The event data sources for forecasted events.
  // This can differentiate between supported event types as well as MRW/NRW data sources.
  // If this is empty, then the country is not supported for NRW.
  supportedEventDataSources: EventDataSources[];
}

// Supported event data sources for a country.
export enum EventDataSources {
  Nrw = 'nrw',
  Mrw = 'mrw',
}

// Extents for the raster metadata
export interface RasterExtent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
}

// Metadata for a raster image from the IBF API
export interface RasterMetadataResponse {
    metadata: {
        coloured: {
            extent: RasterExtent;
        };
    };
}

// Details needed by the map when an event is selected
// This is derived from EventResponseDto and passed to the map component
export interface SelectedEventDetails {
  eventId: number;
  centroid: {
    latitude: number;
    longitude: number;
  };
  // Alert class of the parent event, used to pick the color ramp for exposed areas
  alertClass: AlertClass;

  // Exposure data for the current event, keyed by admin level,
  // and sorted from lowest to highest (which is a byproduct of being a Record type).

  // Exposed admin areas with their exposed population,
  // keyed by admin level then place code.
  // If new data is needed to be passed to the map for rendering, add that data
  // to this object.
  exposedPopulationPerAreaByLevel: Record<number, Record<string, number>>;
  // Highest exposed population value per whole admin level.
  // This is precomputed so we don't need to find the highest value for every feature render.
  highestExposedPopulationByLevel: Record<number, number>;
}
