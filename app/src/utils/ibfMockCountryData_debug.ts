import {
    type MapLayerDetails,
    MapLayerDisplayType,
    MapLayerInfoType,
} from '#utils/ibfMapTypes';

// Mock country map data for countries that don't yet have backend support
export default {
    MW: [
        { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
    ],
    KE: [
        { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
    ],
    ZM: [
        { resourceId: '', dataType: MapLayerInfoType.Population, displayType: MapLayerDisplayType.Raster },
    ],
} as Record<string, MapLayerDetails[]>;
