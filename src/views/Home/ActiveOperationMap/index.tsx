import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToMap,
    unique,
    sum,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import { ChevronRightLineIcon } from '@ifrc-go/icons';

import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import GoMapDisclaimer from '#components/GoMapDisclaimer';
import RadioInput from '#components/RadioInput';
import Container from '#components/Container';
import Link from '#components/Link';
import useInputState from '#hooks/useInputState';
import {
    defaultMapStyle,
    defaultMapOptions,
} from '#utils/map';
import { Appeal } from '#types/emergency';
import { Country } from '#types/country';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import commonStrings from '#strings/common';

import {
    ScaleOption,
    getScaleOptions,
    getLegendOptions,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForFinancialRequirements,
    outerCircleLayerOptionsForPeopleTargeted,
    basePointLayerOptions,
    APPEAL_TYPE_MULTIPLE,
} from './utils';
import styles from './styles.module.css';

const today = new Date().toISOString();
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface Props {
    className?: string;
}

function ActiveOperationMap(props: Props) {
    const {
        className,
    } = props;

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('peopleTargeted');
    const strings = useTranslation('common', commonStrings);
    const {
        response: appealResponse,
    } = useRequest<ListResponse<Appeal>>({
        url: 'api/v2/appeal/',
        query: {
            end_date__gt: today,
            limit: 200,
        },
    });

    const {
        response: countryResponse,
    } = useRequest<ListResponse<Country>>({
        url: 'api/v2/country/',
        query: {
            limit: 500,
        },
    });

    const [
        scaleOptions,
        legendOptions,
    ] = useMemo(() => ([
        getScaleOptions(strings),
        getLegendOptions(strings),
    ]), [strings]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection => {
            const countryGroupedAppeal = listToGroupList(
                appealResponse?.results ?? [],
                (appeal) => appeal.country.iso3,
            );

            const countryToOperationTypeMap = mapToMap(
                countryGroupedAppeal,
                (key) => key,
                (appealList) => {
                    const uniqueAppealList = unique(
                        appealList.map((appeal) => appeal.atype),
                    );

                    const peopleTargeted = sum(
                        appealList.map((appeal) => appeal.num_beneficiaries),
                    );
                    const financialRequirements = sum(
                        appealList.map((appeal) => +appeal.amount_requested),
                    );

                    if (uniqueAppealList.length > 1) {
                        // multiple types
                        return {
                            appealType: APPEAL_TYPE_MULTIPLE,
                            peopleTargeted,
                            financialRequirements,
                        };
                    }

                    return {
                        appealType: uniqueAppealList[0],
                        peopleTargeted,
                        financialRequirements,
                    };
                },
            );

            return {
                type: 'FeatureCollection' as const,
                features: countryResponse?.results
                    .filter((country) => country.independent || country.record_type)
                    .map((country) => {
                        if (!country.centroid || !country.iso3) {
                            return undefined;
                        }

                        const operation = countryToOperationTypeMap[country.iso3];
                        if (isNotDefined(operation)) {
                            return undefined;
                        }

                        return {
                            type: 'Feature' as const,
                            geometry: country.centroid,
                            properties: {
                                id: country.iso3,
                                appealType: operation.appealType,
                                peopleTargeted: operation.peopleTargeted,
                                financialRequirements: operation.financialRequirements,
                            },
                        };
                    }).filter(isDefined) ?? [],
            };
        },
        [countryResponse, appealResponse],
    );

    const heading = resolveToComponent(
        strings.activeOperationsTitle,
        { numAppeals: appealResponse?.count ?? '--' },
    );

    return (
        <Container
            className={_cs(styles.activeOperationMap, className)}
            heading={heading}
            withHeaderBorder
            actions={(
                <Link
                    to="/"
                    actions={<ChevronRightLineIcon />}
                    underline
                >
                    {strings.highlightedOperationsViewAll}
                </Link>
            )}
        >
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition="top-right"
            >
                <div className={styles.mapContainerWrapper}>
                    <MapContainer className={styles.mapContainer} />
                    <GoMapDisclaimer className={styles.mapDisclaimer} />
                </div>
                <MapSource
                    sourceKey="points"
                    sourceOptions={sourceOptions}
                    geoJson={countryCentroidGeoJson}
                >
                    <MapLayer
                        layerKey="point-circle"
                        layerOptions={basePointLayerOptions}
                    />
                    <MapLayer
                        key={scaleBy}
                        layerKey="outer-circle"
                        layerOptions={
                            scaleBy === 'peopleTargeted'
                                ? outerCircleLayerOptionsForPeopleTargeted
                                : outerCircleLayerOptionsForFinancialRequirements
                        }
                    />
                </MapSource>
            </Map>
            <div className={styles.footer}>
                <div className={styles.left}>
                    <RadioInput
                        label={strings.explanationBubbleScalePoints}
                        name={undefined}
                        options={scaleOptions}
                        keySelector={optionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={scaleBy}
                        onChange={setScaleBy}
                    />
                </div>
                <div className={styles.legend}>
                    {legendOptions.map((legendItem) => (
                        <div
                            key={legendItem.value}
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
        </Container>
    );
}

export default ActiveOperationMap;
