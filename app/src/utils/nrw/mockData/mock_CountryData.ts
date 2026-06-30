import {
    type CountryMapData,
    EventDataSources,
} from '#utils/nrw/nrwMapTypes';
import {
    LayerName,
    LayerType,
} from '#utils/nrw/shared-enums';

// Mock country map data for countries.
export default {
    MWI: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.Point,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    KEN: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    ZMB: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    PHL: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    ETH: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
        ],
        supportedEventDataSources: [],
    },
    LSO: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    SSD: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    UGA: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
        ],
        supportedEventDataSources: [],
    },
    ZWE: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
} as Record<string, CountryMapData>;
