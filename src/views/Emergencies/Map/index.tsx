import {
    useMemo, useCallback, useState,
} from 'react';
import {
    _cs,
    isDefined,
    listToGroupList,
    unique,
    listToMap,
    isTruthyString,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';

import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import RadioInput from '#components/RadioInput';
import Container from '#components/Container';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import LegendItem from '#components/LegendItem';
import TextOutput from '#components/TextOutput';
import useInputState from '#hooks/useInputState';
import useTranslation from '#hooks/useTranslation';
import type { GoApiResponse } from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import { resolveToComponent } from '#utils/translation';
import { getNumAffected } from '#utils/domain/emergency';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import BaseMap from '#components/domain/BaseMap';

import i18n from './i18n.json';
import {
    ScaleOption,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForNumEvents,
    outerCircleLayerOptionsForPeopleTargeted,
    basePointLayerOptions,
    adminFillLayerOptions,
    RESPONSE_LEVEL_WITHOUT_IFRC_RESPONSE,
    RESPONSE_LEVEL_MIXED_RESPONSE,
    RESPONSE_LEVEL_WITH_IFRC_RESPONSE,
    COLOR_WITHOUT_IFRC_RESPONSE,
    COLOR_WITH_IFRC_RESPONSE,
    COLOR_MIXED_RESPONSE,
} from './utils';
import styles from './styles.module.css';

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

// NOTE: we can get this information from mapbox studio
interface CountryProperties {
    country_id: number;
    disputed: boolean;
    fdrs: string;
    independent: boolean;
    is_deprecated: boolean;
    iso: string;
    iso3: string;
    name: string;
    name_ar: string;
    name_es: string;
    name_fr: string;
    record_type: number;
    region_id: number;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, CountryProperties>;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    eventList: EventListItem[] | undefined;
    className?: string;
}

function EmergenciesMap(props: Props) {
    const {
        className,
        eventList,
    } = props;

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint| undefined>();

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('numAffected');
    const strings = useTranslation(i18n);

    const scaleOptions: ScaleOption[] = useMemo(() => ([
        { value: 'numAffected', label: strings.emergenciesScaleByNumPeopleAffected },
        { value: 'numEvents', label: strings.emergenciesScaleByNumEmergencies },
    ]), [
        strings.emergenciesScaleByNumPeopleAffected,
        strings.emergenciesScaleByNumEmergencies,
    ]);

    const legendOptions = useMemo(() => ([
        {
            value: RESPONSE_LEVEL_WITHOUT_IFRC_RESPONSE,
            label: strings.emergenciesMapWithoutIFRC,
            color: COLOR_WITHOUT_IFRC_RESPONSE,
        },
        {
            value: RESPONSE_LEVEL_WITH_IFRC_RESPONSE,
            label: strings.emergenciesMapWithIFRC,
            color: COLOR_WITH_IFRC_RESPONSE,
        },
        {
            value: RESPONSE_LEVEL_MIXED_RESPONSE,
            label: strings.emergenciesMapMixResponse,
            color: COLOR_MIXED_RESPONSE,
        },
    ]), [
        strings.emergenciesMapWithoutIFRC,
        strings.emergenciesMapWithIFRC,
        strings.emergenciesMapMixResponse,
    ]);

    const countryResponse = useCountryRaw();

    const countryGroupedEvents = useMemo(() => {
        if (isNotDefined(countryResponse) || isNotDefined(eventList)) {
            return {};
        }

        const countryCentroidMap = listToMap(
            countryResponse?.filter(
                (country) => isTruthyString(country.iso3) && isDefined(country.centroid),
            ),
            (country) => country.iso3 ?? 'unknown',
            (country) => country.centroid,
        );

        const allEventCountries = eventList.flatMap(
            (event) => event.countries.map((country) => ({
                details: event,
                country: {
                    ...country,
                    centroid: country.iso3 ? countryCentroidMap?.[country.iso3] : undefined,
                },
            })),
        );

        return listToGroupList(
            allEventCountries,
            (eventCountry) => eventCountry.country.iso3 ?? 'unknown',
        );
    }, [eventList, countryResponse]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
            const countryKeys = Object.keys(countryGroupedEvents);

            return {
                type: 'FeatureCollection' as const,
                features: countryKeys
                    .filter((key) => {
                        const groupedEvents = countryGroupedEvents[key];
                        const currentCountry = groupedEvents[0].country;

                        return currentCountry.independent || currentCountry.record_type;
                    })
                    .map((key) => {
                        const groupedEvents = countryGroupedEvents[key];
                        const currentEvent = groupedEvents[0];
                        const currentCountry = currentEvent.country;

                        if (
                            isNotDefined(currentCountry.centroid)
                            || isNotDefined(currentCountry.iso3)
                        ) {
                            return undefined;
                        }

                        let responseLevel = RESPONSE_LEVEL_WITHOUT_IFRC_RESPONSE;
                        const uniqueGroupedEvents = unique(
                            groupedEvents,
                            (event) => event.details.id,
                        );

                        if (uniqueGroupedEvents.length > 1) {
                            responseLevel = RESPONSE_LEVEL_MIXED_RESPONSE;
                        } else {
                            const event = currentEvent;
                            if (event.details.appeals && event.details.appeals.length > 0) {
                                responseLevel = RESPONSE_LEVEL_WITH_IFRC_RESPONSE;
                            }
                        }
                        const peopleAffected = sumSafe(
                            (groupedEvents.map(
                                (event) => (
                                    getNumAffected(event.details)
                                ),
                            )),
                        );

                        return {
                            type: 'Feature' as const,
                            geometry: currentCountry.centroid as {
                                type: 'Point',
                                coordinates: [number, number],
                            },
                            properties: {
                                id: key,
                                responseLevel,
                                numEvents: groupedEvents.length,
                                peopleAffected,
                            },
                        };
                    }).filter(isDefined) ?? [],
            };
        },
        [countryGroupedEvents],
    );

    const heading = resolveToComponent(
        strings.emergenciesMapTitle,
        { numEmergencies: eventList?.length ?? '--' },
    );

    const handleCountryClick = useCallback((
        feature: mapboxgl.MapboxGeoJSONFeature,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPointProperties({
            feature: feature as unknown as ClickedPoint['feature'],
            lngLat,
        });
        return false;
    }, []);

    const handlePointClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

    const popupDetails = clickedPointProperties
        ? countryGroupedEvents[clickedPointProperties.feature.properties.iso3]
        : undefined;

    return (
        <Container
            className={_cs(styles.emergenciesMap, className)}
            heading={heading}
            withHeaderBorder
            actions={(
                <Link
                    to="allEmergencies"
                    withUnderline
                    withLinkIcon
                >
                    {strings.emergenciesMapViewAll}
                </Link>
            )}
        >
            <BaseMap
                baseLayers={(
                    <MapLayer
                        layerKey="admin-0"
                        hoverable
                        layerOptions={adminFillLayerOptions}
                        onClick={handleCountryClick}
                    />
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                    title={strings.emergenciesDownloadMapTitle}
                    footer={(
                        <div className={styles.footer}>
                            <div className={styles.left}>
                                <RadioInput
                                    label={strings.emergenciesScaleByLabel}
                                    name={undefined}
                                    options={scaleOptions}
                                    keySelector={optionKeySelector}
                                    labelSelector={optionLabelSelector}
                                    value={scaleBy}
                                    onChange={setScaleBy}
                                />
                            </div>
                            <div className={styles.legend}>
                                {strings.emergenciesKey}
                                {legendOptions.map((legendItem) => (
                                    <LegendItem
                                        className={styles.legendItem}
                                        key={legendItem.value}
                                        label={legendItem.label}
                                        color={legendItem.color}
                                    />
                                ))}
                            </div>
                            <div>
                                {strings.emergenciesMapDescription}
                            </div>
                        </div>
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
                        layerOptions={
                            scaleBy === 'numEvents'
                                ? outerCircleLayerOptionsForNumEvents
                                : outerCircleLayerOptionsForPeopleTargeted
                        }
                    />
                </MapSource>
                {clickedPointProperties?.lngLat && (
                    <MapPopup
                        onCloseButtonClick={handlePointClose}
                        coordinates={clickedPointProperties.lngLat}
                        heading={(
                            <Link
                                to="countriesLayout"
                                urlParams={{
                                    countryId: clickedPointProperties.feature.properties.country_id,
                                }}
                            >
                                {clickedPointProperties.feature.properties.name}
                            </Link>
                        )}
                        childrenContainerClassName={styles.popupContent}
                    >
                        {popupDetails?.map(
                            (event) => (
                                <Container
                                    key={event.details.id}
                                    className={styles.popupAppeal}
                                    childrenContainerClassName={styles.popupAppealDetail}
                                    heading={event.details.name}
                                    headingLevel={5}
                                >
                                    <TextOutput
                                        label={strings.emergenciesPeopleAffected}
                                        value={getNumAffected(event.details)}
                                        valueType="number"
                                    />
                                </Container>
                            ),
                        )}
                        {(isNotDefined(popupDetails) || popupDetails.length === 0) && (
                            <div className={styles.empty}>
                                {strings.emergenciesMapPopoverEmpty}
                            </div>
                        )}
                    </MapPopup>
                )}
            </BaseMap>
        </Container>
    );
}

export default EmergenciesMap;