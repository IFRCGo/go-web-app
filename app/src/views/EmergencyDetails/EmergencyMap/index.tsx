import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
} from '@togglecorp/re-map';
import type { FillLayer } from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import {
    COLOR_LIGHT_GREY,
    COLOR_RED,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { getCountryListBoundingBox } from '#utils/map';
import { type GoApiResponse } from '#utils/restRequest';

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

    const adminOneHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
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

    // FIXME: this might be a mistake
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
                key: 0,
                label: strings.affectedCountry,
                color: COLOR_LIGHT_GREY,
            },
            {
                key: 1,
                label: strings.affectedProvince,
                color: COLOR_RED,
            },
        ]),
        [
            strings.affectedCountry,
            strings.affectedProvince,
        ],
    );

    return (
        <div className={_cs(styles.emergencyMap, className)}>
            <BaseMap
                baseLayers={(
                    <>
                        <MapLayer
                            layerKey="admin-0-highlight"
                            layerOptions={adminZeroHighlightLayerOptions}
                        />
                        <MapLayer
                            layerKey="admin-1-highlight"
                            layerOptions={adminOneHighlightLayerOptions}
                        />
                        <MapLayer
                            layerKey="admin-1-label-selected"
                            layerOptions={adminOneLabelSelectedLayerOptions}
                        />
                    </>
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                    footer={(
                        <div className={styles.footer}>
                            {legendOptions.map((legendItem) => (
                                <div
                                    key={legendItem.key}
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
                    )}
                />
                {isDefined(bounds) && (
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        bounds={bounds}
                        padding={DEFAULT_MAP_PADDING}
                    />
                )}
            </BaseMap>
        </div>
    );
}

export default EmergencyMap;
