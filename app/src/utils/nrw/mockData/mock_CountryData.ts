import {
    type CountryMapData,
    EventDataSources,
    MapLayerDisplayType,
    MapLayerInfoType,
} from '#utils/nrw/nrwMapTypes';

// Mock country map data for countries.
export default {
    MWI: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
            {
                resourceId: MapLayerInfoType.RedCrossBranches,
                dataType: MapLayerInfoType.RedCrossBranches,
                displayType: MapLayerDisplayType.Point,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    KEN: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
            {
                resourceId: MapLayerInfoType.RedCrossBranches,
                dataType: MapLayerInfoType.RedCrossBranches,
                displayType: MapLayerDisplayType.Point,
            },
            {
                resourceId: MapLayerInfoType.Clinics,
                dataType: MapLayerInfoType.Clinics,
                displayType: MapLayerDisplayType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    ZMB: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    PHL: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
            {
                resourceId: MapLayerInfoType.RedCrossBranches,
                dataType: MapLayerInfoType.RedCrossBranches,
                displayType: MapLayerDisplayType.Point,
            },
            {
                resourceId: MapLayerInfoType.Clinics,
                dataType: MapLayerInfoType.Clinics,
                displayType: MapLayerDisplayType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    ETH: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
        ],
        supportedEventDataSources: [],
    },
    LSO: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
            {
                resourceId: MapLayerInfoType.RedCrossBranches,
                dataType: MapLayerInfoType.RedCrossBranches,
                displayType: MapLayerDisplayType.Point,
            },
            {
                resourceId: MapLayerInfoType.Clinics,
                dataType: MapLayerInfoType.Clinics,
                displayType: MapLayerDisplayType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    SSD: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
            {
                resourceId: MapLayerInfoType.RedCrossBranches,
                dataType: MapLayerInfoType.RedCrossBranches,
                displayType: MapLayerDisplayType.Point,
            },
            {
                resourceId: MapLayerInfoType.Clinics,
                dataType: MapLayerInfoType.Clinics,
                displayType: MapLayerDisplayType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
    UGA: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
        ],
        supportedEventDataSources: [],
    },
    ZWE: {
        availableLayers: [
            {
                resourceId: MapLayerInfoType.Population,
                dataType: MapLayerInfoType.Population,
                displayType: MapLayerDisplayType.Raster,
            },
            {
                resourceId: MapLayerInfoType.RedCrossBranches,
                dataType: MapLayerInfoType.RedCrossBranches,
                displayType: MapLayerDisplayType.Point,
            },
        ],
        supportedEventDataSources: [],
    },
} as Record<string, CountryMapData>;
