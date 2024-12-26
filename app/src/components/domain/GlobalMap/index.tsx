import {
    useMemo,
    useState,
} from 'react';
import { MapLayer } from '@togglecorp/re-map';
import {
    type Expression,
    type FillLayer,
    type FillPaint,
    type LngLatLike,
    type MapboxGeoJSONFeature,
} from 'mapbox-gl';

import BaseMap, { type Props as BaseMapProps } from '#components/domain/BaseMap';
import {
    COLOR_BLACK,
    type CountryRecordTypeEnum,
} from '#utils/constants';

export interface AdminZeroFeatureProperties {
    country_id: number;
    disputed: boolean;
    independent: boolean;
    is_deprecated: boolean;
    name: string;
    name_ar: string;
    name_es: string;
    name_fr: string;
    record_type: CountryRecordTypeEnum;

    // NOTE: we check for undefined iso3 before triggering
    // onClick and onHover
    iso3: string;

    fdrs?: string;
    iso?: string;
    region_id?: number;
}

const KOSOVO_ISO3 = 'XKX';
const WESTERN_SAHARA_ISO3 = 'ESH';

const overlappedDisputedCountriesIso3 = [
    KOSOVO_ISO3,
    WESTERN_SAHARA_ISO3,
];

const adminZeroHighlightPaint: FillPaint = {
    'fill-color': COLOR_BLACK,
    'fill-opacity': [
        'case',
        ['all',
            ['==', ['feature-state', 'hovered'], true],
            ['!=', ['get', 'iso3'], null],
        ],
        0.2,
        0,
    ],
};

interface Props extends BaseMapProps {
    adminZeroFillPaint?: mapboxgl.FillPaint,
    onAdminZeroFillHover?: (
        hoveredFeatureProperties: AdminZeroFeatureProperties | undefined
    ) => void;
    onAdminZeroFillClick?: (
        clickedFeatureProperties: AdminZeroFeatureProperties,
        lngLat: LngLatLike,
    ) => void;
}

function GlobalMap(props: Props) {
    const {
        onAdminZeroFillHover: onHover,
        onAdminZeroFillClick: onClick,
        adminZeroFillPaint,
        baseLayers,
        ...baseMapProps
    } = props;

    const [hoveredCountryIso3, setHoveredCountryIso3] = useState<string | undefined>();

    const handleFeatureMouseEnter = (feature: MapboxGeoJSONFeature) => {
        const hoveredFeatureProperties = feature.properties as (
            AdminZeroFeatureProperties | undefined
        );

        setHoveredCountryIso3(hoveredFeatureProperties?.iso3);

        if (onHover) {
            onHover(hoveredFeatureProperties);
        }
    };

    const handleFeatureMouseLeave = () => {
        setHoveredCountryIso3(undefined);

        if (onHover) {
            onHover(undefined);
        }
    };

    const handleClick = (feature: MapboxGeoJSONFeature, lngLat: LngLatLike) => {
        if (onClick) {
            onClick(
                feature.properties as AdminZeroFeatureProperties,
                lngLat,
            );
        }

        return true;
    };

    const fillSortKey = useMemo<number | Expression>(() => [
        'match',
        ['get', 'iso3'],
        // NOTE: Hovered geoarea should be at the top
        hoveredCountryIso3 ?? '???',
        2,
        // NOTE: After that, we should have geoarea that is 100%
        // included in another geoarea
        ...(overlappedDisputedCountriesIso3.filter(
            (iso3) => !(iso3 === hoveredCountryIso3),
        ).flatMap((iso3) => [iso3, 1])),
        // NOTE: Everything else should be after that
        0,
    ], [hoveredCountryIso3]);

    const adminZeroHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: {
                visibility: 'visible',
                'fill-sort-key': fillSortKey,
            },
            paint: adminZeroHighlightPaint,
            filter: ['!=', ['get', 'iso3'], null],
        }),
        [fillSortKey],
    );

    const adminZeroBaseLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: {
                visibility: 'visible',
                'fill-sort-key': fillSortKey,
            },
            paint: adminZeroFillPaint,
        }),
        [fillSortKey, adminZeroFillPaint],
    );

    return (
        <BaseMap
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...baseMapProps}
            baseLayers={(
                <>
                    <MapLayer
                        layerKey="admin-0"
                        layerOptions={adminZeroBaseLayerOptions}
                        onMouseEnter={handleFeatureMouseEnter}
                        onMouseLeave={handleFeatureMouseLeave}
                    />
                    {(onHover || onClick) && (
                        <MapLayer
                            layerKey="admin-0-highlight"
                            layerOptions={adminZeroHighlightLayerOptions}
                            onClick={onClick ? handleClick : undefined}
                        />
                    )}
                    {baseLayers}
                </>
            )}
        />
    );
}

export default GlobalMap;
