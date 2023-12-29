import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LegendItem } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import type { FillLayer } from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import {
    COLOR_LIGHT_GREY,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import type { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

const COLOR_SEVERITY_LOW = '#ccd2d9';
const COLOR_SEVERITY_MEDIUM = '#99a5b4';
const COLOR_SEVERITY_HIGH = '#67788d';
const COLOR_SEVERITY_SEVERE = '#344b67';

const SEVERITY_LOW = 2;
const SEVERITY_MEDIUM = 5;
const SEVERITY_HIGH = 10;

interface Props {
    className?: string;
    sidebarContent?: React.ReactNode;
    emergencyProjectCountByDistrict: Record<number, number>;
}

function ResponseActivitiesMap(props: Props) {
    const {
        className,
        sidebarContent,
        emergencyProjectCountByDistrict,
    } = props;

    const strings = useTranslation(i18n);
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const bounds = useMemo(
        () => (countryResponse ? getBbox(countryResponse?.bbox) : undefined),
        [countryResponse],
    );

    const emergencyProjectCountByDistrictList = mapToList(
        emergencyProjectCountByDistrict,
        (value, key) => ({ district: key, count: value }),
    );

    const districtIdList = useMemo(
        () => emergencyProjectCountByDistrictList.map(
            (list) => Number(list.district),
        ),
        [emergencyProjectCountByDistrictList],
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

    const adminOneHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => {
            if (isNotDefined((emergencyProjectCountByDistrictList))
                || emergencyProjectCountByDistrictList.length < 1) {
                return {
                    type: 'fill',
                    layout: { visibility: 'visible' },
                    paint: {
                        'fill-color': COLOR_LIGHT_GREY,
                    },
                };
            }

            return {
                type: 'fill',
                layout: { visibility: 'visible' },
                paint: {
                    'fill-color': [
                        'match',
                        ['get', 'district_id'],
                        ...(emergencyProjectCountByDistrictList).flatMap(({ district, count }) => [
                            Number(district),
                            [
                                'interpolate',
                                ['exponential', 1],
                                ['number', count],
                                0,
                                COLOR_SEVERITY_LOW,
                                SEVERITY_LOW,
                                COLOR_SEVERITY_MEDIUM,
                                SEVERITY_MEDIUM,
                                COLOR_SEVERITY_HIGH,
                                SEVERITY_HIGH,
                                COLOR_SEVERITY_SEVERE,
                            ],
                        ]),
                        COLOR_LIGHT_GREY,
                    ],
                },
            };
        },
        [emergencyProjectCountByDistrictList],
    );

    return (
        <div className={_cs(styles.map, className)}>
            <div className={styles.mapWithLegend}>
                <BaseMap
                    baseLayers={(
                        <>
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
                            <div className={styles.legend}>
                                <div className={styles.label}>
                                    {strings.countryResponseActivitiesNumberOfProjects}
                                </div>
                                <LegendItem
                                    color={COLOR_SEVERITY_LOW}
                                    label={strings.countryResponseActivitiesSeverityLow}
                                />
                                <LegendItem
                                    color={COLOR_SEVERITY_MEDIUM}
                                    label={strings.countryResponseActivitiesSeverityMedium}
                                />
                                <LegendItem
                                    color={COLOR_SEVERITY_HIGH}
                                    label={strings.countryResponseActivitiesSeverityHigh}
                                />
                                <LegendItem
                                    color={COLOR_SEVERITY_SEVERE}
                                    label={strings.countryResponseActivitiesSeveritySevere}
                                />
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
            {sidebarContent && (
                <div className={styles.sidebar}>
                    {sidebarContent}
                </div>
            )}
        </div>
    );
}

export default ResponseActivitiesMap;
