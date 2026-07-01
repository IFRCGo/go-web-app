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
                layerType: LayerType.raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.point,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    KEN: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.point,
            },
        ],
        supportedEventDataSources: [],
    },
    ZMB: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    PHL: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.point,
            },
        ],
        supportedEventDataSources: [],
    },
    ETH: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
        ],
        supportedEventDataSources: [],
    },
    LSO: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.point,
            },
        ],
        supportedEventDataSources: [],
    },
    SSD: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.point,
            },
            {
                resourceId: LayerName.clinics,
                layerName: LayerName.clinics,
                layerType: LayerType.point,
            },
        ],
        supportedEventDataSources: [],
    },
    UGA: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
        ],
        supportedEventDataSources: [],
    },
    ZWE: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layerName: LayerName.population,
                layerType: LayerType.raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layerName: LayerName.redCrossBranches,
                layerType: LayerType.point,
            },
        ],
        supportedEventDataSources: [],
    },
} as Record<string, CountryMapData>;
