import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    DataDisplay,
    LegendItem,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
} from '@togglecorp/re-map';
import type { FillLayer } from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import GoMapContainer from '#components/GoMapContainer';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import {
    COLOR_LIGHT_GREY,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { getCountryListBoundingBox } from '#utils/map';
import type { EmergencyOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';

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
    sidebarContent?: React.ReactNode;
    emergencyProjectCountByDistrict: Record<number, number>;
}

function ActivitiesMap(props: Props) {
    const {
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
        <ListView
            layout="grid"
            withSidebar
        >
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
                <GoMapContainer
                    title="Response Activity Map"
                    footer={(
                        <DataDisplay
                            label={strings.numberOfProjects}
                            value={(
                                <ListView
                                    spacing="sm"
                                    withSpacingOpticalCorrection
                                >
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
                                </ListView>
                            )}
                        />
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
            {sidebarContent}
        </ListView>
    );
}

export default ActivitiesMap;
