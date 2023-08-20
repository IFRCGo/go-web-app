import {
    useState,
    useCallback,
    useMemo,
    type Dispatch,
    type SetStateAction,
} from 'react';
import {
    type SymbolLayer,
    type FillLayer,
    type MapboxGeoJSONFeature,
} from 'mapbox-gl';
import {
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
import turfBbox from '@turf/bbox';

import Modal from '#components/Modal';
import Button from '#components/Button';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import useCountry from '#hooks/domain/useCountry';
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

import styles from './styles.module.css';

export interface Props<NAME> {
    districtsName: NAME;
    countryId: number;
    onModalClose: () => void;
    districtsValue: number[] | undefined;
    districtsOnChange: (newVal: number[] | undefined, districtsName: NAME) => void;
    disabled?: boolean;
    districtsError?: boolean;
    districtOptions: DistrictItem[] | undefined | null;
    districtsOptionsOnChange: Dispatch<SetStateAction<DistrictItem[] | undefined | null>>;
}

function DistrictMap<const NAME>(props: Props<NAME>) {
    const {
        districtsName,
        countryId,
        onModalClose,
        disabled,
        districtsValue,
        districtsOnChange,
        districtOptions,
        districtsOptionsOnChange,
        districtsError,
    } = props;

    const [districts, setDistricts] = useState<number[] | undefined>(districtsValue);

    const countryDetails = useCountry({
        id: countryId,
    });

    const bounds = useMemo(() => {
        if (!countryDetails) {
            return undefined;
        }

        /*
        if (doubleClickedDistrict && districtsResponse) {
            const selectedDistrict = districtsResponse
            .results.find((d) => d.id === doubleClickedDistrict);
            if (selectedDistrict) {
                return turfBbox(selectedDistrict.bbox) as BoundingBox;
            }
        }
        */

        return turfBbox(countryDetails.bbox);
    }, [
        // doubleClickedDistrict,
        // districtsResponse,
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
            visibility: 'visible',
        },
    }), [countryId]);

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
            visibility: 'visible',
        },
    }), [
        countryId,
        districts,
    ]);

    const handleDistrictClick = useCallback((clickedFeature: MapboxGeoJSONFeature) => {
        const properties = clickedFeature?.properties as {
            country_id?: number;
            district_id?: number;
            name?: string;
        };
        if (properties.country_id !== countryId) {
            return false;
        }
        setDistricts((oldVal = []) => {
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
        districtsOptionsOnChange((oldOptions) => {
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
        return false;
    }, [
        countryId,
        districtsOptionsOnChange,
    ]);

    const handleSaveClick = useCallback(() => {
        districtsOnChange(districts, districtsName);
        onModalClose();
    }, [
        onModalClose,
        districtsOnChange,
        districtsName,
        districts,
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
            </Map>
            <div className={styles.rightPane}>
                <DistrictSearchMultiSelectInput
                    error={districtsError}
                    // FIXME: Use strings
                    label="Districts"
                    name="project_districts"
                    countryId={countryId}
                    options={districtOptions}
                    onOptionsChange={districtsOptionsOnChange}
                    value={districts}
                    onChange={setDistricts}
                    disabled={disabled}
                />
            </div>
        </Modal>
    );
}

export default DistrictMap;
