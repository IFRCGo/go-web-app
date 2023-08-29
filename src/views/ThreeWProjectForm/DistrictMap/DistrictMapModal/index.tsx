import {
    useState,
    useCallback,
    useMemo,
    useRef,
    type Dispatch,
    type SetStateAction,
} from 'react';
import {
    type SymbolLayer,
    type FillLayer,
    type MapboxGeoJSONFeature,
} from 'mapbox-gl';
import {
    listToMap,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
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
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    COLOR_DARK_GREY,
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
    onDistrictsChange: (newVal: number[] | undefined, districtsName: NAME) => void;
    districtsError?: string;
    districtOptions: DistrictItem[] | undefined | null;
    onDistrictsOptionsChange: Dispatch<SetStateAction<DistrictItem[] | undefined | null>>;
    admin2Name: ADMIN2_NAME;
    admin2Value: number[] | undefined;
    onAdmin2Change: (newVal: number[] | undefined, admin2Name: ADMIN2_NAME) => void;
    admin2Error?: string;
    admin2Options: {id: number; name: string; district_id: number }[] | undefined | null;
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

    const waitingForDblClick = useRef<number | undefined>(undefined);

    const [districts, setDistricts] = useState<number[] | undefined>(districtsValue);
    const [admin2Selections, setAdmin2Selections] = useState<number[] | undefined>(admin2Value);
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();

    const updateAdmin2 = useCallback((newDistricts: number[] | undefined) => {
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
    }, [
        admin2Selections,
        admin2Options,
    ]);

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

    const {
        response: districtResponse,
    } = useRequest({
        skip: isNotDefined(selectedDistrict),
        url: '/api/v2/district/{id}/',
        pathVariables: selectedDistrict ? {
            id: selectedDistrict,
        } : undefined,
    });

    const countryDetails = useCountry({
        id: countryId,
    });

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

    const adminTwoLabelLayerOptions: Omit<SymbolLayer, 'id'> | undefined = useMemo(() => (
        countryDetails?.iso3 ? ({
            type: 'symbol',
            'source-layer': `go-admin2-${countryDetails?.iso3}-staging`,
            paint: {
                'text-opacity': [
                    'match',
                    ['get', 'admin1_id'],
                    selectedDistrict,
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
        }) : undefined
    ), [
        countryDetails?.iso3,
        selectedDistrict,
    ]);

    const adminOneFillLayerOptions: Omit<FillLayer, 'id'> = useMemo(() => ({
        type: 'fill',
        paint: {
            'fill-color': [
                'match',
                ['get', 'district_id'],
                ...(districts ?? []).map((districtId) => [
                    districtId,
                    COLOR_PRIMARY_RED,
                ]).flat(),
                // FIXME: -1 is there as match requires minium 2 args
                -1, COLOR_DARK_GREY,
                [
                    'case',
                    ['boolean', ['feature-state', 'hovered'], false],
                    COLOR_DARK_GREY,
                    COLOR_LIGHT_GREY,
                ],
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
    }), [
        selectedDistrict,
        countryId,
        districts,
    ]);

    const adminTwoFillLayerOptions = useMemo((): Omit<FillLayer, 'id'> | undefined => (
        (countryDetails?.iso3 && selectedDistrict) ? ({
            type: 'fill',
            'source-layer': `go-admin2-${countryDetails?.iso3}-staging`,
            paint: {
                'fill-color': [
                    'match',
                    ['get', 'id'],
                    ...(admin2Selections ?? []).map((admin2Item) => [
                        admin2Item,
                        COLOR_PRIMARY_RED,
                    ]).flat(),
                    // FIXME: -1 is there as match requires minium 2 args
                    -1, COLOR_DARK_GREY,
                    [
                        'case',
                        ['boolean', ['feature-state', 'hovered'], false],
                        COLOR_DARK_GREY,
                        COLOR_LIGHT_GREY,
                    ],
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
                visibility: selectedDistrict ? 'visible' : 'none',
            },
        }) : undefined
    ), [
        countryDetails?.iso3,
        admin2Selections,
        selectedDistrict,
    ]);

    const handleDistrictClick = useCallback((clickedFeature: MapboxGeoJSONFeature) => {
        if (waitingForDblClick.current) {
            window.clearTimeout(waitingForDblClick.current);
        }
        waitingForDblClick.current = window.setTimeout(
            () => {
                const properties = clickedFeature?.properties as {
                    country_id?: number;
                    district_id?: number;
                    name?: string;
                };
                if (properties.country_id !== countryId) {
                    return;
                }
                onDistrictsOptionsChange((oldOptions) => {
                    if (!properties.name || !properties.district_id) {
                        return oldOptions;
                    }
                    return unique(
                        [
                            ...(oldOptions ?? []),
                            {
                                id: properties.district_id,
                                name: properties.name,
                            },
                        ],
                        (item) => item.id,
                    );
                });
                handleDistrictChange((oldVal = []) => {
                    if (!properties.district_id) {
                        return oldVal;
                    }
                    const index = oldVal?.indexOf(properties.district_id);
                    if (isNotDefined(index) || index === -1) {
                        return [
                            ...oldVal,
                            properties.district_id,
                        ];
                    }
                    const newVal = [...oldVal];
                    newVal.splice(index, 1);

                    return newVal;
                });
            },
            50,
        );

        return false;
    }, [
        countryId,
        onDistrictsOptionsChange,
        handleDistrictChange,
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

    const handleDistrictDoubleClick = useCallback((clickedFeature: MapboxGeoJSONFeature) => {
        if (waitingForDblClick.current) {
            window.clearTimeout(waitingForDblClick.current);
            waitingForDblClick.current = undefined;
        }

        const properties = clickedFeature?.properties as {
            country_id?: number;
            district_id?: number;
            name?: string;
        };
        if (properties.country_id !== countryId) {
            return false;
        }
        if (properties?.district_id) {
            setSelectedDistrict(properties.district_id);
        }
        onDistrictsOptionsChange((oldOptions) => {
            if (!properties.name || !properties.district_id) {
                return oldOptions;
            }
            return unique(
                [
                    ...(oldOptions ?? []),
                    {
                        id: properties.district_id,
                        name: properties.name,
                    },
                ],
                (item) => item.id,
            );
        });
        handleDistrictChange((oldVal = []) => {
            if (!properties.district_id) {
                return oldVal;
            }
            return unique([
                ...oldVal,
                properties.district_id,
            ]);
        });
        return false;
    }, [
        countryId,
        onDistrictsOptionsChange,
        handleDistrictChange,
    ]);

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

    const handleAdmin2Remove = useCallback((admin2Id: number) => {
        setAdmin2Selections((oldVal = []) => (
            oldVal.filter((item) => item !== admin2Id)
        ));
    }, []);

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
            bodyClassName={styles.body}
            size="xl"
        >
            <div className={styles.leftContainer}>
                {selectedDistrict && (
                    <Button
                        name={undefined}
                        onClick={setSelectedDistrict}
                        variant="tertiary"
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
                    {adminTwoFillLayerOptions && (
                        <MapSource
                            sourceKey="country-admin-2"
                            sourceOptions={{
                                type: 'vector',
                                url: `mapbox://go-ifrc.go-admin2-${countryDetails?.iso3}-staging`,
                            }}
                        >
                            <MapLayer
                                layerKey="admin-2-fill"
                                layerOptions={adminTwoFillLayerOptions}
                                onClick={handleAdmin2Click}
                                hoverable
                            />
                            {adminTwoLabelLayerOptions && (
                                <MapLayer
                                    layerKey="admin-2-line"
                                    layerOptions={adminTwoLabelLayerOptions}
                                />
                            )}
                        </MapSource>
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
