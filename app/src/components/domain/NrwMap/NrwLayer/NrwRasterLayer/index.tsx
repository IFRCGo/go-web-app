import { useMemo } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { nrwApi } from '#config';
import { resolveUrl } from '#utils/resolveUrl';
import { useNrwRequest } from '#utils/restRequest';
import {
    type CountryCodeIso3,
    type NrwLayer,
} from '#views/CountryProfileNationalRiskWatch/types';

import useNrwMapLayers, { type MapLayer } from '../useNrwMapLayers';

function NrwRasterLayer(props: {
    id: string;
    countryCodeIso3: CountryCodeIso3;
    name: NrwLayer['name'];
    resourceId?: string;
    isVisible: boolean;
    layerAnchorId: string; // Used to connect layer to statically ordered "anchor" layers in MapBox
}) {
    const {
        id, countryCodeIso3, name, resourceId, isVisible, layerAnchorId,
    } = props;

    const isAlertRaster = isDefined(resourceId);
    const isStaticRaster = !isAlertRaster;

    const { response: staticRaster } = useNrwRequest({
        apiType: 'nrw',
        url: '/rasters/static/{countryCodeIso3}/{layer}',
        pathVariables: {
            countryCodeIso3,
            layer: name,
        },
        skip: !isStaticRaster,
    });

    const { response: alertRaster } = useNrwRequest({
        apiType: 'nrw',
        url: '/rasters/alert/{id}',
        pathVariables: { id: Number(resourceId) },
        skip: !isAlertRaster,
    });

    const response = isAlertRaster ? alertRaster : staticRaster;

    const mapLayers = useMemo<MapLayer[] | undefined>(
        () => {
            if (isNotDefined(response)) {
                return undefined;
            }

            const {
                xmin, ymin, xmax, ymax,
            } = response.metadata.data.extent;

            const url = resolveUrl(
                nrwApi,
                isAlertRaster
                    ? `rasters/alert/${resourceId}/image`
                    : `rasters/static/${countryCodeIso3}/${name}/image`,
            );
            return [{
                id,
                type: 'raster',
                source: {
                    type: 'image',
                    url,
                    coordinates: [
                        [xmin, ymax], // west north
                        [xmax, ymax], // east north
                        [xmax, ymin], // east south
                        [xmin, ymin], // west south
                    ],
                },
                paint: {
                    'raster-resampling': 'nearest',
                },
            }];
        },
        [id, countryCodeIso3, name, resourceId, isAlertRaster, response],
    );

    useNrwMapLayers(mapLayers, isVisible, layerAnchorId);

    return null;
}

export default NrwRasterLayer;
