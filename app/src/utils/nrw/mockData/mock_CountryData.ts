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
                layer: LayerName.population,
                format: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layer: LayerName.redCrossBranches,
                format: LayerType.Point,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    KEN: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layer: LayerName.redCrossBranches,
                format: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layer: LayerName.clinics,
                format: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    ZMB: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    PHL: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layer: LayerName.redCrossBranches,
                format: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layer: LayerName.clinics,
                format: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    ETH: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
        ],
        supportedEventDataSources: [],
    },
    LSO: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layer: LayerName.redCrossBranches,
                format: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layer: LayerName.clinics,
                format: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    SSD: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layer: LayerName.redCrossBranches,
                format: LayerType.Point,
            },
            {
                resourceId: LayerName.clinics,
                layer: LayerName.clinics,
                format: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    UGA: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
        ],
        supportedEventDataSources: [],
    },
    ZWE: {
        availableLayers: [
            {
                resourceId: LayerName.population,
                layer: LayerName.population,
                format: LayerType.Raster,
            },
            {
                resourceId: LayerName.redCrossBranches,
                layer: LayerName.redCrossBranches,
                format: LayerType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
} as Record<string, CountryMapData>;
