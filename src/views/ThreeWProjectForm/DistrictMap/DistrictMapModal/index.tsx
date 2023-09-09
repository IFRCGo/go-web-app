/* eslint-disable max-len */
import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    type Dispatch,
    type SetStateAction,
} from 'react';
import {
    type SymbolLayer,
    type LineLayer,
    type FillLayer,
    type MapboxGeoJSONFeature,
} from 'mapbox-gl';
import {
    listToMap,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import turfBbox from '@turf/bbox';

import Modal from '#components/Modal';
import Button from '#components/Button';
import List from '#components/List';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import useCountry from '#hooks/domain/useCountry';
import { useRequest } from '#utils/restRequest';
import {
    defaultMapStyle,
    defaultMapOptions,
    defaultNavControlPosition,
    defaultNavControlOptions,
} from '#utils/map';
import Map, {
    MapSource,
    MapLayer,
    MapBounds,
} from '@togglecorp/re-map';
import {
    COLOR_BLACK,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    COLOR_DARK_GREY,
    COLOR_TEXT,
    COLOR_TEXT_ON_DARK,
} from '#utils/constants';
import DistrictSearchMultiSelectInput, {
    type DistrictItem,
} from '#components/domain/DistrictSearchMultiSelectInput';
import NonFieldError from '#components/NonFieldError';

import DistrictListItem from './DistrictItem';

import styles from './styles.module.css';

const districtKeySelector = (item: number) => item;

export interface Props<NAME, ADMIN2_NAME> {
    countryId: number;
    disabled?: boolean;
    onModalClose: () => void;
    districtsName: NAME;
    districtsValue: number[] | undefined;
    districtsError?: string;
    districtOptions: DistrictItem[] | undefined | null;
    onDistrictsChange: (newVal: number[] | undefined, districtsName: NAME) => void;
    onDistrictsOptionsChange: Dispatch<SetStateAction<DistrictItem[] | undefined | null>>;
    admin2Name: ADMIN2_NAME;
    admin2Value: number[] | undefined;
    admin2Error?: string;
    admin2Options: {id: number; name: string; district_id: number }[] | undefined | null;
    onAdmin2Change: (newVal: number[] | undefined, admin2Name: ADMIN2_NAME) => void;
    onAdmin2OptionsChange: Dispatch<
        SetStateAction<{ id: number; name: string; district_id: number }[] | undefined | null>
    >;
}

function DistrictMap<const NAME, const ADMIN2_NAME>(props: Props<NAME, ADMIN2_NAME>) {
    const {
        districtsName,
        countryId,
        onModalClose,
        disabled,
        districtsValue,
        onDistrictsChange,
        districtOptions,
        onDistrictsOptionsChange,
        districtsError,
        admin2Name,
        admin2Value,
        onAdmin2Change,
        onAdmin2OptionsChange,
        admin2Options,
        admin2Error,
    } = props;

    const waitingForDblClick = useRef<{
        [key: string]: number | undefined,
    }>({});

    useEffect(
        // eslint-disable-next-line arrow-body-style
        () => {
            return () => {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                Object.values(waitingForDblClick.current).forEach((timeout) => {
                    window.clearTimeout(timeout);
                });
            };
        },
        [],
    );

    const [districts, setDistricts] = useState<number[] | undefined>(districtsValue);
    const [admin2Selections, setAdmin2Selections] = useState<number[] | undefined>(admin2Value);

    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();

    const {
        response: districtResponse,
    } = useRequest({
        skip: isNotDefined(selectedDistrict),
        url: '/api/v2/district/{id}/',
        pathVariables: selectedDistrict ? {
            id: selectedDistrict,
        } : undefined,
        preserveResponse: true,
    });

    const countryDetails = useCountry({
        id: countryId,
    });

    const iso3 = countryDetails?.iso3;

    const bounds = useMemo(() => {
        if (!countryDetails) {
            return undefined;
        }

        if (selectedDistrict && districtResponse?.bbox) {
            return turfBbox(districtResponse.bbox);
        }

        return turfBbox(countryDetails.bbox);
    }, [
        selectedDistrict,
        districtResponse,
        countryDetails,
    ]);

    const adminLabelLayerOptions: Omit<SymbolLayer, 'id'> = useMemo(() => ({
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
                0, 1,
            ],
            visibility: selectedDistrict ? 'none' : 'visible',
        },
    }), [
        countryId,
        selectedDistrict,
    ]);

    const adminOneFillLayerOptions: Omit<FillLayer, 'id'> = useMemo(() => {
        const defaultColor: NonNullable<FillLayer['paint']>['fill-color'] = [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            COLOR_DARK_GREY,
            COLOR_LIGHT_GREY,
        ];
        const options: Omit<FillLayer, 'id'> = {
            type: 'fill',
            paint: {
                'fill-color': (!districts || districts.length <= 0)
                    ? defaultColor
                    : [
                        'match',
                        ['get', 'district_id'],
                        ...districts.flatMap((districtId) => [
                            districtId,
                            COLOR_PRIMARY_RED,
                        ]),
                        defaultColor,
                    ],
                'fill-outline-color': COLOR_DARK_GREY,
                'fill-opacity': [
                    'match',
                    ['get', 'country_id'],
                    countryId,
                    1,
                    0,
                ],
            },
            layout: {
                visibility: selectedDistrict ? 'none' : 'visible',
            },
        };
        return options;
    }, [
        countryId,
        districts,
        selectedDistrict,
    ]);

    const adminTwoLineLayerOptions: Omit<LineLayer, 'id'> | undefined = useMemo(() => (
        iso3 && selectedDistrict ? ({
            type: 'line',
            'source-layer': `go-admin2-${iso3}-staging`,
            paint: {
                'line-color': COLOR_BLACK,
                'line-opacity': [
                    'match',
                    ['get', 'admin1_id'],
                    selectedDistrict,
                    1,
                    0,
                ],
            },
            layout: {
                visibility: 'visible',
            },
        }) : undefined
    ), [
        iso3,
        selectedDistrict,
    ]);

    const adminTwoFillLayerOptions = useMemo((): Omit<FillLayer, 'id'> | undefined => {
        if (!iso3 || !selectedDistrict) {
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
                'fill-color': (!admin2Selections || admin2Selections.length <= 0)
                    ? defaultColor
                    : [
                        'match',
                        ['get', 'id'],
                        ...admin2Selections.map((admin2Item) => [
                            admin2Item,
                            COLOR_PRIMARY_RED,
                        ]).flat(),
                        defaultColor,
                    ],
                'fill-outline-color': COLOR_DARK_GREY,
                'fill-opacity': [
                    'match',
                    ['get', 'admin1_id'],
                    selectedDistrict,
                    1,
                    0,
                ],
            },
            layout: {
                visibility: 'visible',
            },
        };
        return options;
    }, [
        iso3,
        admin2Selections,
        selectedDistrict,
    ]);

    const adminTwoLabelLayerOptions = useMemo((): Omit<SymbolLayer, 'id'> | undefined => {
        const textColor: NonNullable<SymbolLayer['paint']>['text-color'] = (
            admin2Selections && admin2Selections.length > 0
                ? [
                    'match',
                    ['get', 'id'],
                    ...admin2Selections.map((admin2) => [
                        admin2,
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
                'text-opacity': [
                    'match',
                    ['get', 'admin1_id'],
                    selectedDistrict,
                    1,
                    0,
                ],
            },
            layout: {
                'text-field': ['get', 'name'],
                'text-anchor': 'center',
                'text-size': 10,
            },
        };
        return options;
    }, [iso3, admin2Selections, selectedDistrict]);

    const updateAdmin2 = useCallback(
        (newDistricts: number[] | undefined) => {
            const admin2ToDistrictMap = listToMap(
                admin2Options,
                (item) => item.id,
                (item) => item.district_id,
            );
            const filteredAdmin2s = admin2Selections?.filter(
                (item) => (
                    admin2ToDistrictMap
                        ? newDistricts?.includes(admin2ToDistrictMap?.[item])
                        : false
                ),
            );
            setAdmin2Selections(filteredAdmin2s);
        },
        [
            admin2Selections,
            admin2Options,
        ],
    );

    const handleDistrictChange = useCallback<typeof setDistricts>(
        (x) => {
            if (typeof x === 'function') {
                setDistricts((prevValue) => {
                    const newValue = x(prevValue);

                    // TODO: Research if we can call function with setState here?
                    updateAdmin2(newValue);
                    return newValue;
                });
            } else {
                updateAdmin2(x);
                setDistricts(x);
            }
        },
        [updateAdmin2],
    );

    const handleDistrictClick = useCallback((clickedFeature: MapboxGeoJSONFeature) => {
        // console.log('single click register', new Date().getTime());
        const properties = clickedFeature.properties as {
            country_id?: number;
            district_id?: number;
            name?: string;
        };
        if (properties.country_id !== countryId) {
            return false;
        }
        const id = properties.district_id;
        if (!id) {
            return false;
        }

        if (waitingForDblClick.current[id]) {
            window.clearTimeout(waitingForDblClick.current[id]);
        }
        waitingForDblClick.current[id] = window.setTimeout(
            () => {
                onDistrictsOptionsChange((oldOptions) => {
                    if (!properties.name) {
                        return oldOptions;
                    }
                    return unique(
                        [
                            ...(oldOptions ?? []),
                            {
                                id,
                                name: properties.name,
                            },
                        ],
                        (item) => item.id,
                    );
                });
                handleDistrictChange((oldVal = []) => {
                    // console.log('single click call', new Date().getTime());
                    const index = oldVal?.indexOf(id);
                    if (isNotDefined(index) || index === -1) {
                        return [
                            ...oldVal,
                            id,
                        ];
                    }
                    const newVal = [...oldVal];
                    newVal.splice(index, 1);

                    return newVal;
                });
            },
            // Why we are using 500ms
            // https://en.wikipedia.org/wiki/Double-click#Speed_and_timing
            500,
        );

        return false;
    }, [
        countryId,
        onDistrictsOptionsChange,
        handleDistrictChange,
    ]);

    const handleDistrictDoubleClick = useCallback((clickedFeature: MapboxGeoJSONFeature) => {
        // console.log('double click call', new Date().getTime());
        const properties = clickedFeature?.properties as {
            country_id?: number;
            district_id?: number;
            name?: string;
        };
        if (properties.country_id !== countryId) {
            return false;
        }
        const id = properties.district_id;
        if (!id) {
            return false;
        }

        if (waitingForDblClick.current[id]) {
            window.clearTimeout(waitingForDblClick.current[id]);
            waitingForDblClick.current[id] = undefined;
        }

        setSelectedDistrict(id);
        onDistrictsOptionsChange((oldOptions) => {
            if (!properties.name) {
                return oldOptions;
            }
            return unique(
                [
                    ...(oldOptions ?? []),
                    {
                        id,
                        name: properties.name,
                    },
                ],
                (item) => item.id,
            );
        });
        handleDistrictChange((oldVal = []) => (
            unique([
                ...oldVal,
                id,
            ])
        ));
        return false;
    }, [
        countryId,
        onDistrictsOptionsChange,
        handleDistrictChange,
    ]);

    const handleDistrictRemove = useCallback((districtId: number) => {
        if (districtId === selectedDistrict) {
            setSelectedDistrict(undefined);
        }
        handleDistrictChange((oldVal = []) => (
            oldVal.filter((item) => item !== districtId)
        ));
    }, [
        handleDistrictChange,
        selectedDistrict,
    ]);

    const handleAdmin2Click = useCallback((clickedFeature: MapboxGeoJSONFeature) => {
        const properties = clickedFeature?.properties as {
            id: number;
            admin1_id: number;
            name?: string;
        };
        if (properties.admin1_id !== selectedDistrict) {
            return false;
        }
        onAdmin2OptionsChange((oldOptions) => {
            if (!properties.name || !properties.id) {
                return oldOptions;
            }
            return unique(
                [
                    ...(oldOptions ?? []),
                    {
                        id: properties.id,
                        district_id: properties.admin1_id,
                        name: properties.name,
                    },
                ],
                (item) => item.id,
            );
        });
        setAdmin2Selections((oldVal = []) => {
            if (!properties.id) {
                return oldVal;
            }
            const index = oldVal?.indexOf(properties.id);
            if (isNotDefined(index) || index === -1) {
                return [
                    ...oldVal,
                    properties.id,
                ];
            }
            const newVal = [...oldVal];
            newVal.splice(index, 1);

            return newVal;
        });
        return false;
    }, [
        selectedDistrict,
        onAdmin2OptionsChange,
    ]);

    const handleAdmin2Remove = useCallback((admin2Id: number) => {
        setAdmin2Selections((oldVal = []) => (
            oldVal.filter((item) => item !== admin2Id)
        ));
    }, []);

    const handleSaveClick = useCallback(() => {
        onDistrictsChange(districts, districtsName);
        onAdmin2Change(admin2Selections, admin2Name);
        onModalClose();
    }, [
        admin2Name,
        admin2Selections,
        onAdmin2Change,
        onModalClose,
        onDistrictsChange,
        districtsName,
        districts,
    ]);

    const districtRendererParams = useCallback((districtId: number) => ({
        districtId,
        districtOptions,
        onDistrictRemove: handleDistrictRemove,
        onAdmin2Remove: handleAdmin2Remove,
        admin2Options,
        admin2Selections,
    }), [
        districtOptions,
        admin2Selections,
        admin2Options,
        handleDistrictRemove,
        handleAdmin2Remove,
    ]);

    return (
        <Modal
            className={styles.districtMapModal}
            // FIXME: Use translations
            heading="Select Province / Region"
            onClose={onModalClose}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSaveClick}
                >
                    {/* FIXME: Use translations */}
                    Save
                </Button>
            )}
            childrenContainerClassName={styles.body}
            size="xl"
        >
            <div className={styles.leftContainer}>
                {selectedDistrict && (
                    <Button
                        name={undefined}
                        onClick={setSelectedDistrict}
                        variant="tertiary"
                        icons={(
                            <ChevronLeftLineIcon className={styles.backButton} />
                        )}
                    >
                        {/* FIXME: Use translations */}
                        Back to Country
                    </Button>
                )}
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
                            layerOptions={adminOneFillLayerOptions}
                            onClick={!disabled ? handleDistrictClick : undefined}
                            onDoubleClick={!disabled ? handleDistrictDoubleClick : undefined}
                        />
                        <MapLayer
                            layerKey="admin-1-label"
                            layerOptions={adminLabelLayerOptions}
                        />
                        {bounds && (
                            <MapBounds
                                duration={3000}
                                padding={50}
                                bounds={bounds}
                            />
                        )}
                    </MapSource>
                    {adminTwoFillLayerOptions && adminTwoLineLayerOptions && adminTwoLabelLayerOptions && (
                        <>
                            <MapSource
                                sourceKey="country-admin-2"
                                sourceOptions={{
                                    type: 'vector',
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
                </Map>
            </div>
            <div className={styles.rightPane}>
                <NonFieldError error={admin2Error} />
                <DistrictSearchMultiSelectInput
                    error={districtsError}
                    // FIXME: Use strings
                    label="Districts"
                    name="project_districts"
                    countryId={countryId}
                    options={districtOptions}
                    onOptionsChange={onDistrictsOptionsChange}
                    value={districts}
                    onChange={handleDistrictChange}
                    disabled={disabled}
                />
                <List
                    data={districts}
                    renderer={DistrictListItem}
                    keySelector={districtKeySelector}
                    rendererParams={districtRendererParams}
                    errored={false}
                    pending={false}
                    filtered={false}
                />
            </div>
        </Modal>
    );
}

export default DistrictMap;
