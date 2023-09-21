import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import {
    useOutletContext,
} from 'react-router-dom';
import type { FillLayer } from 'mapbox-gl';
import Map, {
    MapSource,
    MapLayer,
    MapBounds,
} from '@togglecorp/re-map';

import LegendItem from '#components/LegendItem';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useTranslation from '#hooks/useTranslation';
import type { EmergencyOutletContext } from '#utils/outletContext';
import {
    defaultMapStyle,
    defaultMapOptions,
    defaultNavControlPosition,
    defaultNavControlOptions,
    getCountryListBoundingBox,
    adminLabelLayerOptions,
} from '#utils/map';
import {
    DURATION_MAP_ZOOM,
    DEFAULT_MAP_PADDING,
    COLOR_LIGHT_GREY,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

const COLOR_SEVERITY_LOW = '#ccd2d9';
const COLOR_SEVERITY_MEDIUM = '#99a5b4';
const COLOR_SEVERITY_HIGH = '#67788d';
const COLOR_SEVERITY_SEVERE = '#344b67';

const SEVERITY_LOW = 2;
const SEVERITY_MEDIUM = 5;
const SEVERITY_HIGH = 10;

function getEmergencyCountryIdList(emergency: EmergencyOutletContext['emergencyResponse']) {
    return unique(emergency?.countries.map((country) => country.id).filter(isDefined) ?? []);
}

interface Props {
    className?: string;
    sidebarContent?: React.ReactNode;
    emergencyProjectCountByDistrict: Record<number, number>;
}

function ActivitiesMap(props: Props) {
    const {
        className,
        sidebarContent,
        emergencyProjectCountByDistrict,
    } = props;

    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const countryList = useCountryRaw();

    const emergencyCountryList = useMemo(() => {
        const emergencyCountryIdList = getEmergencyCountryIdList(emergencyResponse);

        return emergencyCountryIdList.map((countryId) => (
            countryList?.find((country) => country.id === countryId)
        )).filter(isDefined);
    }, [emergencyResponse, countryList]);

    const bounds = useMemo(
        () => getCountryListBoundingBox(emergencyCountryList),
        [emergencyCountryList],
    );

    const emergencyProjectCountByDistrictList = mapToList(
        emergencyProjectCountByDistrict,
        (value, key) => ({ district: key, count: value }),
    );

    const adminOneHightlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
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
                            layerKey="admin-1-highlight"
                            hoverable
                            layerOptions={adminOneHightlightLayerOptions}
                        />
                        <MapLayer
                            layerKey="admin-1-label"
                            layerOptions={adminLabelLayerOptions}
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
                <div className={styles.legend}>
                    <div className={styles.label}>
                        {strings.numberOfProjects}
                    </div>
                    <LegendItem
                        color={COLOR_SEVERITY_LOW}
                        label={strings.severityLow}
                    />
                    <LegendItem
                        color={COLOR_SEVERITY_MEDIUM}
                        label={strings.severityMedium}
                    />
                    <LegendItem
                        color={COLOR_SEVERITY_HIGH}
                        label={strings.severityHigh}
                    />
                    <LegendItem
                        color={COLOR_SEVERITY_SEVERE}
                        label={strings.severitySevere}
                    />
                </div>
            </div>
            {sidebarContent && (
                <div className={styles.sidebar}>
                    {sidebarContent}
                </div>
            )}
        </div>
    );
}

export default ActivitiesMap;
