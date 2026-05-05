import {
    type CountryMapData,
    EventDataSources,
    MapLayerDisplayType,
    MapLayerInfoType,
} from '#utils/ibfMapTypes';

// Mock country map data for countries. This will be moved to the backend in the future.
export default {
    MWI: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
            { resourceId: '', dataType: MapLayerInfoType.RedCrossBranches, displayType: MapLayerDisplayType.Point },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    KEN: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
            { resourceId: '', dataType: MapLayerInfoType.RedCrossBranches, displayType: MapLayerDisplayType.Point },
            { resourceId: '', dataType: MapLayerInfoType.Clinics, displayType: MapLayerDisplayType.Point },
        ],
        supportedEventDataSources: [],
    },
    ZMB: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
        ],
        supportedEventDataSources: [EventDataSources.Nrw],
    },
    PHL: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
            { resourceId: '', dataType: MapLayerInfoType.RedCrossBranches, displayType: MapLayerDisplayType.Point },
            { resourceId: '', dataType: MapLayerInfoType.Clinics, displayType: MapLayerDisplayType.Point },
        ],
        supportedEventDataSources: [],
    },
    ETH: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
        ],
        supportedEventDataSources: [],
    },
    LSO: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
            { resourceId: '', dataType: MapLayerInfoType.RedCrossBranches, displayType: MapLayerDisplayType.Point },
            { resourceId: '', dataType: MapLayerInfoType.Clinics, displayType: MapLayerDisplayType.Point },
        ],
        supportedEventDataSources: [],
    },
    SSD: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
            { resourceId: '', dataType: MapLayerInfoType.RedCrossBranches, displayType: MapLayerDisplayType.Point },
            { resourceId: '', dataType: MapLayerInfoType.Clinics, displayType: MapLayerDisplayType.Point },
        ],
        supportedEventDataSources: [],
    },
    UGA: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
        ],
        supportedEventDataSources: [],
    },
    ZWE: {
        availableLayers: [
            { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
            { resourceId: '', dataType: MapLayerInfoType.RedCrossBranches, displayType: MapLayerDisplayType.Point },
        ],
        supportedEventDataSources: [],
    },
} as Record<string, CountryMapData>;
