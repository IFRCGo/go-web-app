import { rasterImageDir } from '#config';
import VectorTileLayer from 'ol/layer/VectorTile';
import MVT from 'ol/format/MVT';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import { MvtStyleCreator } from './ibfMapStyles';
import VectorTile from 'ol/source/VectorTile';

// Debug file for raster testing.
// This will be removed once the dev test flow is set up.
export const debug_testImageName = `flood_map_ZMB_RP20_c0_b3857`;

/**
 * Create a vector tile layer for the map.
 * @param selectedCountry The ISO_A2 code of the selected country, or noCountrySelectedValue for none.
 * @param mapVectorTileUrl The URL template for the vector tiles
 * @param getMapStyle A function for an MVT tile style creator
 * @returns A VectorTileLayer
 */
export const makeMvtLayerAsync = (
    selectedCountry: string,
    mapVectorTileUrl: string,
    getMapStyle: MvtStyleCreator
) => {
    return new VectorTileLayer({
        source: new VectorTile({
            url: mapVectorTileUrl,
            format: new MVT(),
            maxZoom: 2,
        }),
        style: (feature) => getMapStyle(feature, selectedCountry),
    });
}

/**
 * Creates a static layer from a png and json file with the extents. *
 * @param name name of the image (no extension)
 * @returns ImageLayer to add to a map
 */
export const makeStaticImageLayer = async (name: string) => {
    const extents = await getImageExtentsAsync(name);
    const rasterData = await getRasterDataPng(name);
    return new ImageLayer({
        source: new ImageStatic({
            url: rasterData,
            projection: 'EPSG:3857',
            interpolate: false,
            imageExtent: extents,
        }),
    });
}

/**
 * Get the png raster data from the server (or debug folder when testing). *
 * @param name filename (no extension)
 * @returns the png image
 */
const getRasterDataPng = (name : string) => {
    // Currently this only supports the debug dev flow.
    // The logic will be added to later to support the actual meta data flow.
    
    // For now, return a png for the local raster image dir.
    return `${rasterImageDir}${name}.png`;
}

/**
 * Returns the extents from the png meta data. *
 * @param name the same name as the image
 * @returns the extents in EPSG:3857, ordered [left, bottom, right, top]
 */
const getImageExtentsAsync = (name : string) => {
    // Currently this only supports the debug dev flow.
    // The logic will be added to later to support the actual meta data flow.

    const jsonData = `${rasterImageDir}${name}.json`;
    // fetch json and get the extents from it
    return fetch(jsonData)
        .then(response => response.json())
        .then(data => {
            if (data && data.bounds) {
                const { left, bottom, right, top } = data.bounds;
                return [left, bottom, right, top];
            } else {
                throw new Error('Invalid JSON structure: missing "bounds" property');
            }
        })
        .catch(error => {
            console.error('Error loading image extents:', error);
            // Return default extents or handle as needed
            return [0, 0, 0, 0];
        });
}
