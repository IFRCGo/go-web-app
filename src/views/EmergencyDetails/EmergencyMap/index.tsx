import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import type { FillLayer } from 'mapbox-gl';
import Map, {
    MapBounds,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';

import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';
import {
    defaultMapStyle,
    defaultMapOptions,
    defaultNavControlPosition,
    defaultNavControlOptions,
    getCountryListBoundingBox,
} from '#utils/map';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import {
    COLOR_LIGHT_GREY,
    COLOR_RED,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventItem = GoApiResponse<'/api/v2/event/{id}'>;

interface Props {
    event: EventItem;
    className?: string;
}

function EmergencyMap(props: Props) {
    const {
        className,
        event,
    } = props;

    const strings = useTranslation(i18n);
    const countriesRaw = useCountryRaw();

    const countryMapById = useMemo(
        () => listToMap(
            countriesRaw,
            (country) => country.id,
        ),
        [countriesRaw],
    );

    const countryIdList = useMemo(
        () => event.countries.map(
            (country) => country.id,
        ),
        [event],
    );

    const countryList = useMemo(
        () => countryIdList.map(
            (countryId) => {
                const country = countryMapById?.[countryId];

                if (isNotDefined(country)) {
                    return undefined;
                }

                return country;
            },
        ).filter(isDefined),
        [countryIdList, countryMapById],
    );

    const bounds = useMemo(
        () => getCountryListBoundingBox(countryList),
        [countryList],
    );
    const districtIdList = useMemo(
        () => event.districts.map(
            (district) => district.id,
        ),
        [event],
    );

    const adminOneHightlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            filter: [
                'in',
                'district_id',
                ...districtIdList,
            ],
        }),
        [districtIdList],
    );

    const adminOneLabelSelectedLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            filter: [
                'in',
                'district_id',
                ...districtIdList,
            ],
        }),
        [districtIdList],
    );

    const adminZeroHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            filter: [
                '!in',
                'country_id',
                ...countryIdList,
            ],
        }),
        [countryIdList],
    );

    const legendOptions = useMemo(
        () => ([
            {
                label: strings.affectedCountry,
                color: COLOR_LIGHT_GREY,
            },
            {
                label: strings.affectedProvince,
                color: COLOR_RED,
            },
        ]),
        [strings],
    );

    return (
        <div className={_cs(styles.emergencyMap, className)}>
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition={defaultNavControlPosition}
                navControlOptions={defaultNavControlOptions}
                scaleControlShown={false}
            >
                <MapContainerWithDisclaimer className={styles.mapContainer} />
                <MapSource
                    sourceKey="composite"
                    managed={false}
                >
                    <MapLayer
                        layerKey="admin-0-highlight"
                        layerOptions={adminZeroHighlightLayerOptions}
                    />
                    <MapLayer
                        layerKey="admin-1-highlight"
                        hoverable
                        layerOptions={adminOneHightlightLayerOptions}
                    />
                    <MapLayer
                        layerKey="admin-1-label-selected"
                        layerOptions={adminOneLabelSelectedLayerOptions}
                    />
                </MapSource>
                {isDefined(bounds) && (
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        bounds={bounds}
                        padding={DEFAULT_MAP_PADDING}
                    />
                )}
            </Map>
            <div className={styles.footer}>
                {legendOptions.map((legendItem) => (
                    <div
                        key={legendItem.label}
                        className={styles.legendItem}
                    >
                        <div
                            className={styles.color}
                            style={{ backgroundColor: legendItem.color }}
                        />
                        <div className={styles.label}>
                            {legendItem.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EmergencyMap;
