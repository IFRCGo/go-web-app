import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    LegendItem,
    ListView,
    RadioInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToMap,
    unique,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { type LngLatBoundsLike } from 'mapbox-gl';

import GoMapContainer from '#components/GoMapContainer';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useInputState from '#hooks/useInputState';
import {
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import GlobalMap, { type AdminZeroFeatureProperties } from '../../GlobalMap';
import {
    APPEAL_TYPE_MULTIPLE,
    basePointLayerOptions,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForFinancialRequirements,
    outerCircleLayerOptionsForPeopleTargeted,
    type ScaleOption,
    severityOrderMapping,
} from '../utils';

import i18n from './i18n.json';

type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

type LegendOptions = {
    value: number;
    label: string;
    color: string;
}

interface ClickedPoint {
    featureProperties: AdminZeroFeatureProperties;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    variant: 'crisis' | 'appeal';
    presentationModeAdditionalBeforeContent?: React.ReactNode;
    presentationModeAdditionalAfterContent?: React.ReactNode;
    mapTitle: string;
    bbox: LngLatBoundsLike | undefined;
    appealResponse?: AppealResponse;
    legendOptions: LegendOptions[];
    onPresentationModeChange: (presentation: boolean) => void;
    scaleOptions: ScaleOption[];
}

function OperationMapContainer(props: Props) {
    const {
        variant,
        presentationModeAdditionalBeforeContent,
        presentationModeAdditionalAfterContent,
        mapTitle,
        bbox,
        appealResponse,
        legendOptions,
        onPresentationModeChange,
        scaleOptions,
    } = props;

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('peopleTargeted');
    const strings = useTranslation(i18n);

    const countryResponse = useCountryRaw();

    const [clickedPoint, setClickedPoint] = useState<ClickedPoint | undefined>();

    const countryGroupedAppeal = useMemo(
        () => listToGroupList(
            appealResponse?.results ?? [],
            (appeal) => appeal.country.iso3 ?? '<no-key>',
        ),
        [appealResponse],
    );

    const countryCentroidGeoJson = useMemo((): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
        const countryToOperationTypeMap = mapToMap(
            countryGroupedAppeal,
            (key) => key,
            (appealList) => {
                const uniqueAppealList = unique(
                    appealList.map((appeal) => appeal.atype),
                );

                const uniqueEventList = unique(
                    appealList.map((severity) => severity.event_details
                        ?.ifrc_severity_level).filter(isDefined),
                );

                const peopleTargeted = sumSafe(
                    appealList.map((appeal) => appeal.num_beneficiaries),
                );
                const financialRequirements = sumSafe(
                    appealList.map((appeal) => appeal.amount_requested),
                );

                const severityLevel = (() => {
                    if (uniqueEventList.length > 1) {
                        const highestSeverity = uniqueEventList.sort((a, b) => (
                            compareNumber(severityOrderMapping[a], severityOrderMapping[b])
                        ));
                        return highestSeverity[0];
                    }
                    if (uniqueEventList.length === 0) return undefined;
                    return uniqueEventList[0];
                });

                const appealType = (() => {
                    if (uniqueAppealList.length > 1) return APPEAL_TYPE_MULTIPLE;
                    return uniqueAppealList[0];
                });

                return {
                    appealType: appealType(),
                    severityLevel: severityLevel(),
                    peopleTargeted,
                    financialRequirements,
                };
            },
        );

        return {
            type: 'FeatureCollection' as const,
            features:
                countryResponse
                    ?.map((country) => {
                        if (
                            (!country.independent && isNotDefined(country.record_type))
                            || isNotDefined(country.centroid)
                            || isNotDefined(country.iso3)
                        ) {
                            return undefined;
                        }

                        const operation = countryToOperationTypeMap[country.iso3];
                        if (isNotDefined(operation)) {
                            return undefined;
                        }

                        return {
                            type: 'Feature' as const,
                            geometry: country.centroid as {
                                type: 'Point';
                                coordinates: [number, number];
                            },
                            properties: {
                                id: country.iso3,
                                appealType: operation.appealType,
                                severityLevel: operation.severityLevel,
                                variant,
                                peopleTargeted: operation.peopleTargeted,
                                financialRequirements: operation.financialRequirements,
                            },
                        };
                    })
                    .filter(isDefined) ?? [],
        };
    }, [countryResponse, countryGroupedAppeal, variant]);

    const handleCountryClick = useCallback(
        (
            featureProperties: AdminZeroFeatureProperties,
            lngLat: mapboxgl.LngLatLike,
        ) => {
            setClickedPoint({
                featureProperties,
                lngLat,
            });

            return true;
        },
        [],
    );

    const handlePointClose = useCallback(() => {
        setClickedPoint(undefined);
    }, [setClickedPoint]);

    const popupDetails = clickedPoint
        ? countryGroupedAppeal[clickedPoint.featureProperties.iso3]
        : undefined;

    return (
        <GlobalMap onAdminZeroFillClick={handleCountryClick}>
            <GoMapContainer
                presentationModeAdditionalAfterContent={
                    presentationModeAdditionalAfterContent
                }
                presentationModeAdditionalBeforeContent={
                    presentationModeAdditionalBeforeContent
                }
                withPresentationMode
                onPresentationModeChange={onPresentationModeChange}
                title={mapTitle}
                footer={(
                    <>
                        <RadioInput
                            label={strings.explanationBubbleScalePoints}
                            name={undefined}
                            options={scaleOptions}
                            keySelector={optionKeySelector}
                            labelSelector={optionLabelSelector}
                            value={scaleBy}
                            onChange={setScaleBy}
                        />
                        <ListView withWrap withSpacingOpticalCorrection spacing="sm">
                            {legendOptions.map((legendItem) => (
                                <LegendItem
                                    key={legendItem.value}
                                    color={legendItem.color}
                                    label={legendItem.label}
                                />
                            ))}
                        </ListView>
                    </>
                )}
            />
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
                    layerKey="point-outer-circle"
                    layerOptions={scaleBy === 'peopleTargeted'
                        ? outerCircleLayerOptionsForPeopleTargeted
                        : outerCircleLayerOptionsForFinancialRequirements}
                />
            </MapSource>
            {clickedPoint?.lngLat && (
                <MapPopup
                    onCloseButtonClick={handlePointClose}
                    coordinates={clickedPoint.lngLat}
                    heading={(
                        <Link
                            to="countriesLayout"
                            urlParams={{
                                countryId: clickedPoint.featureProperties.country_id,
                            }}
                        >
                            {clickedPoint.featureProperties.name}
                        </Link>
                    )}
                    withPadding
                    empty={isNotDefined(popupDetails) || popupDetails.length === 0}
                    emptyMessage={strings.operationPopoverEmpty}
                >
                    <ListView layout="block" spacing="sm" withSpacingOpticalCorrection>
                        {popupDetails?.map((appeal) => (
                            <Container
                                key={appeal.id}
                                heading={appeal.name}
                                headerDescription={(
                                    <TextOutput
                                        textSize="sm"
                                        valueType="date"
                                        withLightText
                                        label={strings.lastUpdateLabel}
                                        value={appeal.modified_at}
                                    />
                                )}
                                headingLevel={6}
                                spacing="xs"
                            >
                                <ListView
                                    layout="block"
                                    spacing="2xs"
                                    withSpacingOpticalCorrection
                                >
                                    <TextOutput
                                        value={appeal.num_beneficiaries}
                                        description={strings.operationPopoverPeopleAffected}
                                        valueType="number"
                                        textSize="sm"
                                    />
                                    <TextOutput
                                        value={appeal.amount_requested}
                                        description={strings.operationPopoverAmountRequested}
                                        valueType="number"
                                        textSize="sm"
                                    />
                                    <TextOutput
                                        value={appeal.amount_funded}
                                        description={strings.operationPopoverAmountFunded}
                                        valueType="number"
                                        textSize="sm"
                                    />
                                </ListView>
                            </Container>
                        ))}
                    </ListView>
                </MapPopup>
            )}
            {isDefined(bbox) && (
                <MapBounds
                    duration={DURATION_MAP_ZOOM}
                    bounds={bbox}
                    padding={DEFAULT_MAP_PADDING}
                />
            )}
        </GlobalMap>
    );
}

export default OperationMapContainer;
