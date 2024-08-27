import {
    useCallback,
    useMemo,
} from 'react';
import {
    BlockLoading,
    Container,
    List,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getPercentage,
    maxSafe,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    compareDate,
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    BUFFERS,
    isValidFeatureCollection,
    isValidPointFeature,
    NODES,
    TRACKS,
    UNCERTAINTY_FIVE_DAYS,
    UNCERTAINTY_THREE_DAYS,
} from '#utils/domain/risk';
import { type RiskApiResponse } from '#utils/restRequest';

import LayerDetails, { Props as LayerInputProps } from '../../LayerDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Option {
    key: number;
    label: string;
}

type PdcResponse = RiskApiResponse<'/api/v1/pdc/'>;
type PdcEventItem = NonNullable<PdcResponse['results']>[number];
type PdcExposure = RiskApiResponse<'/api/v1/pdc/{id}/exposure/'>;

interface Props {
    data: PdcEventItem;
    exposure: PdcExposure | undefined;
    pending: boolean;
    onLayerChange: (value: boolean, name: number) => void;
    layers: Record<number, boolean>;
}

function EventDetails(props: Props) {
    const {
        data: {
            hazard_name,
            start_date,
            pdc_created_at,
            pdc_updated_at,
            description,
            hazard_type,
        },
        exposure,
        pending,
        layers,
        onLayerChange,
    } = props;

    const strings = useTranslation(i18n);

    const options: Option[] = useMemo(() => [
        {
            key: NODES,
            label: strings.pdcEventLayerNodes,
        },
        {
            key: TRACKS,
            label: strings.pdcEventLayerTracks,
        },
        {
            key: BUFFERS,
            label: strings.pdcEventLayerBuffers,
        },
        {
            key: UNCERTAINTY_FIVE_DAYS,
            label: strings.pdcEventLayerForecastUncertaintyFiveDays,
        },
        {
            key: UNCERTAINTY_THREE_DAYS,
            label: strings.pdcEventLayerForecastUncertaintyThreeDays,
        },
    ], [strings]);
    interface Exposure {
        value?: number | null;
        valueFormatted?: string | null;
    }

    // NOTE: these are stored as json so we don't have typings for these
    const popExposure = exposure?.population_exposure as {
        total?: Exposure | null;
        households?: Exposure | null;
        vulnerable?: Exposure | null;
    } | null;

    // NOTE: these are stored as json so we don't have typings for these
    const capitalExposure = exposure?.capital_exposure as {
        total?: Exposure | null;
        school?: Exposure | null;
        hospital?: Exposure | null;
    } | null;

    const stormPoints = useMemo(
        () => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const { storm_position_geojson } = exposure;

            const stormPositions = (storm_position_geojson as unknown as unknown[] | undefined)
                ?.filter(isValidPointFeature);

            const stormGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...stormPositions?.map(
                        (pointFeature) => ({
                            ...pointFeature,
                            properties: {
                                ...pointFeature.properties,
                            },
                        }),
                    ) ?? [],
                ].filter(isDefined),
            };

            const geoJson = isValidFeatureCollection(stormGeoJson)
                ? stormGeoJson
                : undefined;

            const points = geoJson?.features.map(
                (pointFeature) => {
                    if (
                        !isValidPointFeature(pointFeature)
                            || isNotDefined(pointFeature.properties)
                    ) {
                        return undefined;
                    }

                    const {
                        wind_speed_mph,
                        forecast_date_time,
                    } = pointFeature.properties;

                    if (isNotDefined(wind_speed_mph) || isFalsyString(forecast_date_time)) {
                        return undefined;
                    }

                    const date = new Date(forecast_date_time);

                    return {
                        id: date.getTime(),
                        windSpeed: wind_speed_mph,
                        date,
                    };
                },
            ).filter(isDefined).sort(
                (a, b) => compareDate(a.date, b.date),
            );

            return points;
        },
        [exposure],
    );

    const maxWindSpeed = maxSafe(
        stormPoints?.map(({ windSpeed }) => windSpeed),
    );

    const layerRendererParams = useCallback(
        (_: number, layerOptions: Option): LayerInputProps => ({
            options: layerOptions,
            value: layers,
            onChange: onLayerChange,

        }),
        [layers, onLayerChange],
    );

    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={hazard_name}
            headingLevel={4}
            spacing="compact"
            headerDescriptionContainerClassName={styles.eventMeta}
            headerDescription={(
                <>
                    <TextOutput
                        label={strings.eventDetailsStartedOn}
                        value={start_date}
                        valueType="date"
                        strongValue
                    />
                    <TextOutput
                        label={strings.eventDetailsCreatedOn}
                        value={pdc_created_at}
                        valueType="date"
                        strongValue
                    />
                    <TextOutput
                        label={strings.eventDetailsUpdatedOn}
                        value={pdc_updated_at}
                        valueType="date"
                        strongValue
                    />
                </>
            )}
        >
            {pending && <BlockLoading />}
            {!pending && (
                <>
                    <div className={styles.exposureDetails}>
                        <TextOutput
                            label={strings.eventDetailsPeopleExposed}
                            value={popExposure?.total?.valueFormatted}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsHouseholdExposed}
                            value={popExposure?.households?.valueFormatted}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsPeopleGroups}
                            value={popExposure?.vulnerable?.valueFormatted}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsValueExposed}
                            value={capitalExposure?.total?.valueFormatted}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsSchoolExposed}
                            value={capitalExposure?.school?.valueFormatted}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventHospitalsExposed}
                            value={capitalExposure?.hospital?.valueFormatted}
                            strongValue
                        />
                    </div>
                    {hazard_type === 'TC' && (
                        <Container heading={strings.pdcEventLayerTitle}>
                            <List
                                className={styles.layerDetail}
                                data={options}
                                renderer={LayerDetails}
                                rendererParams={layerRendererParams}
                                keySelector={(item: Option) => item.key}
                                withoutMessage
                                compact
                                pending={false}
                                errored={false}
                                filtered={false}
                            />
                        </Container>
                    )}
                    {stormPoints && stormPoints.length > 0 && isDefined(maxWindSpeed) && (
                        <Container heading={strings.pdcEventChartTitle}>
                            {/* TODO: use proper svg charts */}
                            <div className={styles.windSpeedChart}>
                                <div className={styles.barListContainer}>
                                    {stormPoints.map(
                                        (point) => (
                                            <div
                                                key={point.id}
                                                className={styles.barContainer}
                                            >
                                                <Tooltip
                                                    description={resolveToString(
                                                        strings.pdcEventDetailsKm,
                                                        {
                                                            point: point.windSpeed ?? '--',
                                                            pointDate: point.date.toLocaleString() ?? '--',
                                                        },
                                                    )}
                                                />
                                                <div
                                                    style={{ height: `${getPercentage(point.windSpeed, maxWindSpeed)}%` }}
                                                    className={styles.bar}
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                                <div className={styles.chartLabel}>
                                    {strings.pdcEventChartLabel}
                                </div>
                            </div>
                        </Container>
                    )}
                    <div className={styles.description}>
                        {description}
                    </div>
                </>
            )}
        </Container>
    );
}

export default EventDetails;
