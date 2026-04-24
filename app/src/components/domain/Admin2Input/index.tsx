import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ButtonLayout,
    Container,
    InputError,
    ListView,
    Modal,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import {
    type FillLayer,
    type LineLayer,
    type MapboxGeoJSONFeature,
    type SymbolLayer,
} from 'mapbox-gl';

import GoMapContainer from '#components/GoMapContainer';
import useCountry from '#hooks/domain/useCountry';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    COLOR_BLACK,
    COLOR_DARK_GREY,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    COLOR_TEXT,
    COLOR_TEXT_ON_DARK,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
    MAX_PAGE_LIMIT,
} from '#utils/constants';
import { getGeoJsonBounds } from '#utils/geo';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import BaseMap from '../BaseMap';

import i18n from './i18n.json';

interface Props<NAME> {
    name: NAME;
    value: number[] | null | undefined;
    onChange: (newValue: number[] | undefined, name: NAME) => void;
    countryId: number;
    error?: React.ReactNode;
    readOnly?: boolean;
}

function Admin2Input<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        countryId,
        error,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const countryDetails = useCountry({ id: countryId });
    const iso3 = countryDetails?.iso3;

    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

    const selectedCodesDebounced = useDebouncedValue(selectedCodes, 300);

    const { trigger: retrieveAdmin2Codes } = useLazyRequest({
        url: '/api/v2/admin2/',
        query: {
            id__in: value ?? [],
            limit: MAX_PAGE_LIMIT,
        },
        onSuccess: (response) => {
            const responseCode = response.results.map(({ code }) => code);
            setSelectedCodes(responseCode);
        },
    });

    // NOTE: To check if country has admin2 value or not
    const {
        response: admin2TestResponse,
        pending: admin2TestPending,
    } = useRequest({
        skip: isNotDefined(iso3),
        url: '/api/v2/admin2/',
        query: {
            admin1__country__iso3: iso3 ?? undefined,
            // NOTE: we just need 1 value to check
            limit: 1,
        },
    });

    const hasAdmin2 = !admin2TestPending
        && isDefined(admin2TestResponse)
        && admin2TestResponse?.results.length > 0;

    const { response: admin2Details } = useRequest({
        skip: isNotDefined(selectedCodesDebounced) || selectedCodesDebounced.length === 0,
        url: '/api/v2/admin2/',
        query: {
            code__in: selectedCodesDebounced ?? [],
            limit: MAX_PAGE_LIMIT,
        },
        onSuccess: (response) => {
            onChange(
                response.results.map(({ id }) => id),
                name,
            );
        },
    });

    useEffect(() => {
        // NOTE: Hydrate selected codes from provided value(IDs) on initialization
        if (isDefined(value)
            && value.length > 0
            && selectedCodes.length === 0
        ) {
            retrieveAdmin2Codes(null);
        }
    }, [retrieveAdmin2Codes, value, selectedCodes]);

    const admin2NameMap = listToMap(
        admin2Details?.results,
        ({ id }) => id,
        ({ name: admin2Name, district_name }) => `${admin2Name} (${district_name})`,
    );

    const admin2CodeMap = listToMap(
        admin2Details?.results,
        ({ id }) => id,
        ({ code }) => code,
    );

    const bounds = useMemo(() => {
        if (!countryDetails) {
            return undefined;
        }

        return getGeoJsonBounds(countryDetails.bbox);
    }, [
        countryDetails,
    ]);

    const adminOneLabelLayerOptions: Omit<SymbolLayer, 'id'> = useMemo(() => ({
        type: 'symbol',
        paint: {
            'text-opacity': [
                'match',
                ['get', 'country_id'],
                countryId,
                1,
                0,
            ],
        },
        layout: {
            'text-offset': [
                0,
                1,
            ],
            visibility: 'visible',
        },
    }), [countryId]);

    const adminTwoLineLayerOptions: Omit<LineLayer, 'id'> | undefined = useMemo(() => {
        if (!iso3) {
            return undefined;
        }

        return {
            type: 'line',
            'source-layer': `go-admin2-${iso3}-staging`,
            paint: {
                'line-color': COLOR_BLACK,
                'line-opacity': 1,
            },
            layout: {
                visibility: 'visible',
            },
        };
    }, [iso3]);

    const adminTwoFillLayerOptions = useMemo((): Omit<FillLayer, 'id'> | undefined => {
        if (!iso3) {
            return undefined;
        }
        const defaultColor: NonNullable<FillLayer['paint']>['fill-color'] = [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            COLOR_DARK_GREY,
            COLOR_LIGHT_GREY,
        ];
        const options: Omit<FillLayer, 'id'> = {
            type: 'fill',
            'source-layer': `go-admin2-${iso3}-staging`,
            paint: {
                'fill-color': (!value || value.length <= 0)
                    ? defaultColor
                    : [
                        'match',
                        ['get', 'code'],
                        ...value.map((admin2Id) => [
                            admin2CodeMap?.[admin2Id] ?? admin2Id,
                            COLOR_PRIMARY_RED,
                        ]).flat(),
                        defaultColor,
                    ],
                'fill-outline-color': COLOR_DARK_GREY,
                'fill-opacity': 1,
            },
            layout: {
                visibility: 'visible',
            },
        };
        return options;
    }, [iso3, value, admin2CodeMap]);

    const adminTwoLabelLayerOptions = useMemo((): Omit<SymbolLayer, 'id'> | undefined => {
        const textColor: NonNullable<SymbolLayer['paint']>['text-color'] = (
            value && value.length > 0
                ? [
                    'match',
                    ['get', 'id'],
                    ...value.map((admin2Id) => [
                        admin2Id,
                        COLOR_TEXT_ON_DARK,
                    ]).flat(),
                    COLOR_TEXT,
                ]
                : COLOR_TEXT
        );

        const options: Omit<SymbolLayer, 'id'> = {
            type: 'symbol',
            'source-layer': `go-admin2-${iso3}-centroids`,
            paint: {
                'text-color': textColor,
                'text-opacity': 1,
            },
            layout: {
                'text-field': ['get', 'name'],
                'text-anchor': 'center',
                'text-size': 10,
            },
        };
        return options;
    }, [iso3, value]);

    const handleAdmin2Click = useCallback((clickedFeature: MapboxGeoJSONFeature) => {
        const properties = clickedFeature?.properties as {
            id: number;
            admin1_id: number;
            code: string;
            admin1_name: string;
            name?: string;
        };

        if (isNotDefined(properties.code)) {
            return false;
        }

        setSelectedCodes((prevCodes) => {
            const codeIndex = prevCodes.findIndex((prevCode) => prevCode === properties.code);

            if (codeIndex === -1) {
                return [...prevCodes, properties.code];
            }

            return prevCodes.toSpliced(codeIndex, 1);
        });

        return false;
    }, []);

    const [
        showModal,
        {
            setTrue: setShowModalTrue,
            setFalse: setShowModalFalse,
        },
    ] = useBooleanState(false);

    const removeSelection = useCallback((admin2Id: number) => {
        const index = value?.findIndex((selectedAdmin2Id) => selectedAdmin2Id === admin2Id) ?? -1;

        if (index !== -1) {
            onChange(value?.toSpliced(index, 1), name);
        }
    }, [value, onChange, name]);

    return (
        <ListView layout="block">
            <Container
                heading={strings.heading}
                headingLevel={6}
                footer={(
                    <Button
                        name={undefined}
                        onClick={setShowModalTrue}
                        disabled={readOnly || !hasAdmin2}
                    >
                        {strings.buttonLabel}
                    </Button>
                )}
                withCompactMessage
                empty={!value || value.length === 0}
                emptyMessage={!hasAdmin2 ? strings.emptyMessage : undefined}
                withBorder
                withPadding
            >
                <ListView
                    withWrap
                    spacing="2xs"
                >
                    {value?.map((admin2Id) => (
                        <ButtonLayout
                            key={admin2Id}
                            spacing="2xs"
                            after={(
                                <Button
                                    name={admin2Id}
                                    onClick={removeSelection}
                                    styleVariant="action"
                                    readOnly
                                    disabled={readOnly}
                                >
                                    <CloseLineIcon />
                                </Button>
                            )}
                            readOnly
                            disabled={readOnly}
                        >
                            {admin2NameMap?.[admin2Id] ?? admin2Id}
                        </ButtonLayout>
                    ))}
                </ListView>
            </Container>
            {error && (
                <InputError>
                    {error}
                </InputError>
            )}
            {showModal && (
                <Modal
                    onClose={setShowModalFalse}
                    // FIXME: use strings
                    heading="Select Admin-2"
                    size="xl"
                    footerActions={(
                        <Button
                            name={undefined}
                            onClick={setShowModalFalse}
                            // FIXME: use strings
                        >
                            Done
                        </Button>
                    )}
                >
                    <BaseMap
                        baseLayers={(
                            <MapLayer
                                layerKey="admin-1-label"
                                layerOptions={adminOneLabelLayerOptions}
                            />
                        )}
                    >
                        <GoMapContainer
                            title="Admin-2 Map"
                            withoutDownloadButton
                            withFullHeight
                        />
                        {bounds && (
                            <MapBounds
                                duration={DURATION_MAP_ZOOM}
                                padding={DEFAULT_MAP_PADDING}
                                bounds={bounds}
                            />
                        )}
                        {/* eslint-disable-next-line max-len */}
                        {adminTwoFillLayerOptions && adminTwoLineLayerOptions && adminTwoLabelLayerOptions && (
                            <>
                                <MapSource
                                    sourceKey="country-admin-2"
                                    sourceOptions={{
                                        type: 'vector',
                                        // FIXME: this should be defined as a constant
                                        url: `mapbox://go-ifrc.go-admin2-${iso3}-staging`,
                                    }}
                                >
                                    <MapLayer
                                        layerKey="admin-2-fill"
                                        layerOptions={adminTwoFillLayerOptions}
                                        onClick={handleAdmin2Click}
                                        hoverable
                                    />
                                    <MapLayer
                                        layerKey="admin-2-line"
                                        layerOptions={adminTwoLineLayerOptions}
                                    />
                                </MapSource>
                                <MapSource
                                    sourceKey="country-admin-2-labels"
                                    sourceOptions={{
                                        type: 'vector',
                                        url: `mapbox://go-ifrc.go-admin2-${iso3}-centroids`,
                                    }}
                                >
                                    <MapLayer
                                        layerKey="admin-2-label"
                                        layerOptions={adminTwoLabelLayerOptions}
                                    />
                                </MapSource>
                            </>
                        )}
                    </BaseMap>
                </Modal>
            )}
        </ListView>
    );
}

export default Admin2Input;
