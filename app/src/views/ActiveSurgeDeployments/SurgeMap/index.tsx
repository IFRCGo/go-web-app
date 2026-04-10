import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    LegendItem,
    ListView,
    RadioInput,
    ReducedListDisplay,
    SelectInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    encodeDate,
    numericIdSelector,
    stringNameSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';

import DisplayName from '#components/DisplayName';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import GlobalMap, { type AdminZeroFeatureProperties } from '#components/domain/GlobalMap';
import GoMapContainer from '#components/GoMapContainer';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useInputState from '#hooks/useInputState';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useGoRequest } from '#utils/restRequest';

import {
    basePointLayerOptions,
    COLOR_ERU_AND_PERSONNEL,
    COLOR_ERU_ONLY,
    COLOR_PERSONNEL_ONLY,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForEru,
    outerCircleLayerOptionsForPersonnel,
    type ScaleOption,
    SURGE_TYPE_ERU,
    SURGE_TYPE_ERU_AND_PERSONNEL,
    SURGE_TYPE_PERSONNEL,
} from './utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

const SURGE_MECHANISM_ERU = 1;
const SURGE_MECHANISM_RR = 2;

const now = encodeDate(new Date());

interface ClickedPoint {
    properties: AdminZeroFeatureProperties;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    className?: string;
}

function SurgeMap(props: Props) {
    const { className } = props;

    const [
        disasterFilter,
        setDisasterFilter,
    ] = useInputState<number | undefined>(undefined);
    const [
        surgeMechanismFilter,
        setSurgeMechanismFilter,
    ] = useInputState<number | undefined>(undefined);

    const strings = useTranslation(i18n);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('eru');

    const {
        response: eruResponse,
    } = useGoRequest({
        url: '/api/v2/eru/',
        query: {
            end_date__gt: now,
            deployed_to__isnull: false,
            disaster_type: disasterFilter,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const {
        response: personnelResponse,
    } = useGoRequest({
        url: '/api/v2/personnel/',
        query: {
            end_date__gt: now,
            is_active: true,
            dtype: disasterFilter,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const surgeMechanisms = useMemo(() => (
        [
            {
                id: SURGE_MECHANISM_ERU,
                name: strings.emergencyResponseUnit,
            },
            {
                id: SURGE_MECHANISM_RR,
                name: strings.rapidResponsePersonnel,
            },
        ]
    ), [strings.rapidResponsePersonnel, strings.emergencyResponseUnit]);

    const countryResponse = useCountryRaw();

    const rendererParams = useCallback(
        (value: { name: string }) => ({
            name: value.name,
        }),
        [],
    );

    const legendOptions = useMemo(() => ([
        {
            value: SURGE_TYPE_ERU_AND_PERSONNEL,
            label: strings.eruAndPersonnel,
            color: COLOR_ERU_AND_PERSONNEL,
        },
        {
            value: SURGE_TYPE_ERU,
            label: strings.surgeEruOnly,
            color: COLOR_ERU_ONLY,
        },
        {
            value: SURGE_TYPE_PERSONNEL,
            label: strings.surgePersonnelOnly,
            color: COLOR_PERSONNEL_ONLY,
        },
    ]), [strings]);

    const scaleOptions = useMemo<ScaleOption[]>(() => ([
        { value: 'eru', label: strings.eruLabel },
        { value: 'personnel', label: strings.personnelLabel },
    ]), [strings]);

    const countryGroupedErus = useMemo(() => {
        if (surgeMechanismFilter === SURGE_MECHANISM_RR) {
            return undefined;
        }
        const erusWithCountry = eruResponse?.results
            ?.filter((eru) => isDefined(eru.deployed_to.iso3))
            ?.map((eru) => ({
                units: eru.units,
                deployedTo: eru.deployed_to,
                deployingNS: eru.eru_owner.national_society_country.society_name,
                eruType: eru.type_display,
                event: { id: eru.event?.id, name: eru.event?.name },
            })) ?? [];

        return (
            listToGroupList(
                erusWithCountry,
                (eru) => eru.deployedTo.id,
            )
        );
    }, [eruResponse, surgeMechanismFilter]);

    const countryGroupedPersonnel = useMemo(() => {
        if (surgeMechanismFilter === SURGE_MECHANISM_ERU) {
            return undefined;
        }
        const personnelWithCountry = personnelResponse?.results
            ?.map((personnel) => {
                if (isNotDefined(personnel.deployment.country_deployed_to)) {
                    return undefined;
                }

                return {
                    units: 1,
                    deployedTo: personnel.deployment.country_deployed_to,
                    deployingNS: personnel.country_from?.society_name,
                    roleProfile: personnel.role,
                    event: {
                        id: personnel.deployment.event_deployed_to?.id,
                        name: personnel.deployment.event_deployed_to?.name,
                    },
                };
            }).filter(isDefined);

        return (
            listToGroupList(
                personnelWithCountry,
                (personnel) => personnel.deployedTo?.id ?? '<no-key>',
            )
        );
    }, [personnelResponse, surgeMechanismFilter]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => ({
            type: 'FeatureCollection' as const,
            features: countryResponse
                ?.map((country) => {
                    if (
                        (!country.independent && isNotDefined(country.record_type))
                        || isNotDefined(country.centroid)
                        || isNotDefined(country.iso3)
                    ) {
                        return undefined;
                    }

                    const eruList = countryGroupedErus?.[country.id];
                    const personnelList = countryGroupedPersonnel?.[country.id];
                    if (isNotDefined(eruList) && isNotDefined(personnelList)) {
                        return undefined;
                    }

                    const units = sumSafe(eruList?.map((eru) => eru.units)) ?? 0;
                    const personnel = personnelList ? personnelList.length : 0;

                    return {
                        type: 'Feature' as const,
                        geometry: country.centroid as {
                            type: 'Point',
                            coordinates: [number, number],
                        },
                        properties: {
                            id: country.id,
                            name: country.name,
                            units,
                            personnel,
                        },
                    };
                }).filter(isDefined) ?? [],
        }),
        [countryResponse, countryGroupedErus, countryGroupedPersonnel],
    );

    const popupDetails = clickedPointProperties
        ? {
            eruDeployedEvents: mapToList(
                listToGroupList(
                    countryGroupedErus?.[clickedPointProperties.properties.country_id] ?? [],
                    (eru) => eru.event.id ?? -1,
                ),
                (eru) => ({
                    ...eru[0]!.event,
                    eruType: unique(
                        eru.map((e) => e.eruType).filter(isDefined),
                    ).map((eruType) => ({ name: eruType })),
                    deployingNS: unique(
                        eru.map((e) => e.deployingNS).filter(isDefined),
                    ).map((deployingNS) => ({ name: deployingNS })),
                    units: sumSafe(eru.map((e) => e.units)) ?? 0,
                }),
            ),
            personnelDeployedEvents: mapToList(
                listToGroupList(
                    countryGroupedPersonnel?.[clickedPointProperties.properties.country_id] ?? [],
                    (personnel) => personnel.event.id,
                ),
                (personnel) => ({
                    ...personnel[0]!.event,
                    roleProfile: unique(personnel.map(
                        (p) => p.roleProfile,
                    ).filter(isDefined)).map((roleProfile) => ({ name: roleProfile })),
                    deployingNS: unique(personnel.map(
                        (p) => p.deployingNS,
                    ).filter(isDefined)).map((deployingNS) => ({ name: deployingNS })),
                    units: sumSafe(personnel.map((p) => p.units)) ?? 0,
                }),
            ),
        }
        : undefined;

    const handleCountryClick = useCallback((
        properties: AdminZeroFeatureProperties,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPointProperties({
            properties,
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

    const handleClearFiltersButtonClick = useCallback(() => {
        setDisasterFilter(undefined);
        setSurgeMechanismFilter(undefined);
    }, [setDisasterFilter, setSurgeMechanismFilter]);

    return (
        <Container
            className={_cs(styles.surgeMap, className)}
            heading={strings.surgeMapTitle}
            withHeaderBorder
            filters={(
                <>
                    <DisasterTypeSelectInput
                        placeholder={strings.disasterTypePlaceholder}
                        label={strings.disasterTypeLabel}
                        name="disasterType"
                        value={disasterFilter}
                        onChange={setDisasterFilter}
                    />
                    <SelectInput
                        name={undefined}
                        placeholder={strings.surgeMechanismsPlaceholder}
                        label={strings.surgeMechanismsLabel}
                        value={surgeMechanismFilter}
                        onChange={setSurgeMechanismFilter}
                        options={surgeMechanisms}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                    />
                    <div className={styles.clearButton}>
                        <Button
                            name={undefined}
                            onClick={handleClearFiltersButtonClick}
                            disabled={isNotDefined(disasterFilter)
                                && isNotDefined(surgeMechanismFilter)}
                        >
                            {strings.clearFilters}
                        </Button>
                    </div>
                </>
            )}
        >
            <GlobalMap
                onAdminZeroFillClick={handleCountryClick}
            >
                <GoMapContainer
                    title={strings.surgeDownloadMapTitle}
                    footer={(
                        <>
                            <RadioInput
                                label={strings.explanationScalePoints}
                                name={undefined}
                                options={scaleOptions}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={scaleBy}
                                onChange={setScaleBy}
                            />
                            <ListView withWrap>
                                {legendOptions.map((legendItem) => (
                                    <LegendItem
                                        className={styles.legendItem}
                                        key={legendItem.value}
                                        label={legendItem.label}
                                        color={legendItem.color}
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
                        layerKey="outer-circle"
                        layerOptions={
                            scaleBy === 'eru'
                                ? outerCircleLayerOptionsForEru
                                : outerCircleLayerOptionsForPersonnel
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
                                    countryId: clickedPointProperties.properties.country_id,
                                }}
                            >
                                {clickedPointProperties.properties.name}
                            </Link>
                        )}
                    >
                        {popupDetails?.eruDeployedEvents?.map(
                            (event) => (
                                <Container
                                    key={event.id}
                                    heading={event?.name}
                                    headingLevel={5}
                                >
                                    <TextOutput
                                        value={event.units}
                                        label={strings.deployedEru}
                                        strongLabel
                                        valueType="number"
                                    />
                                    <TextOutput
                                        className={styles.textOutput}
                                        labelClassName={styles.label}
                                        value={(
                                            <ReducedListDisplay
                                                list={event.eruType}
                                                keySelector={stringNameSelector}
                                                renderer={DisplayName}
                                                rendererParams={rendererParams}
                                            />
                                        )}
                                        label={strings.eruType}
                                        strongLabel
                                    />
                                    <TextOutput
                                        className={styles.textOutput}
                                        labelClassName={styles.label}
                                        value={(
                                            <ReducedListDisplay
                                                list={event.deployingNS}
                                                keySelector={stringNameSelector}
                                                renderer={DisplayName}
                                                rendererParams={rendererParams}
                                            />
                                        )}
                                        label={strings.deployingNS}
                                        strongLabel
                                    />
                                </Container>
                            ),
                        )}
                        {popupDetails?.personnelDeployedEvents?.map(
                            (event) => (
                                <Container
                                    key={event.id}
                                    heading={event?.name}
                                    headingLevel={5}
                                >
                                    <TextOutput
                                        value={event.units}
                                        label={strings.deployedPersonnel}
                                        strongLabel
                                        valueType="number"
                                    />
                                    <TextOutput
                                        className={styles.textOutput}
                                        labelClassName={styles.label}
                                        value={(
                                            <ReducedListDisplay
                                                list={event.roleProfile}
                                                keySelector={stringNameSelector}
                                                renderer={DisplayName}
                                                rendererParams={rendererParams}
                                            />
                                        )}
                                        label={strings.roleProfile}
                                        strongLabel
                                    />
                                    <TextOutput
                                        className={styles.textOutput}
                                        labelClassName={styles.label}
                                        value={(
                                            <ReducedListDisplay
                                                list={event.deployingNS}
                                                keySelector={stringNameSelector}
                                                renderer={DisplayName}
                                                rendererParams={rendererParams}
                                            />
                                        )}
                                        label={strings.deployingNS}
                                        strongLabel
                                    />
                                </Container>
                            ),
                        )}
                        {(isNotDefined(popupDetails) || (
                            popupDetails.eruDeployedEvents.length === 0
                            && popupDetails.personnelDeployedEvents.length === 0
                        )) && (
                            <div>
                                {strings.eventPopoverEmpty}
                            </div>
                        )}
                    </MapPopup>
                )}
            </GlobalMap>
        </Container>
    );
}

export default SurgeMap;
