import React from 'react';
import { _cs, listToMap } from '@togglecorp/fujs'; import { bbox as turfBbox } from '@turf/turf';
import { BoundingBox } from '@mapbox/geo-viewport';
import Map, {
    MapContainer,
    MapBounds,
} from '@togglecorp/re-map';
import { IoChevronBack } from 'react-icons/io5';

import { defaultMapStyle, defaultMapOptions } from '#utils/map';
import { ListResponse, useRequest } from '#utils/restRequest';
import BasicModal from '#components/BasicModal';
import GoMapDisclaimer from '#components/GoMapDisclaimer';
import Container from '#components/Container';
import BlockLoading from '#components/block-loading';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import { Admin2, District, Country } from '#types';
import useInputState from '#hooks/useInputState';
import { SetValueArg } from '#utils/common';

import FilterOutput from '../FilterOutput';
import MapDistrictSelect from '../MapDistrictSelect';
import MapAdmin2Select from '../MapAdmin2Select';
import styles from './styles.module.scss';

const mapPadding = {
    left: 20,
    top: 20,
    right: 20,
    bottom: 20,
};

const mapOptions = {
    ...defaultMapOptions,
    scrollZoom: false,
    pitchWithRotate: false,
    dragRotate: false,
    doubleClickZoom: false,
    navControlShown: true,
    displayControlsDefault: false,
};

interface Props<DV extends number, AV extends number> {
    className?: string;
    countryDetails: Country;
    districts: DV[];
    onDistrictsChange: (newValue: SetValueArg<DV[]>) => void;
    admin2s: AV[];
    onAdmin2sChange: (newValue: SetValueArg<AV[]>) => void;
    onCloseButtonClick: () => void;
    onSaveButtonClick: () => void;
}

function RegionSelectionModal<DV extends number, AV extends number>(props: Props<DV, AV>) {
    const {
        className,
        countryDetails,
        districts,
        onDistrictsChange,
        admin2s,
        onAdmin2sChange,
        onCloseButtonClick,
        onSaveButtonClick,
    } = props;

    const [doubleClickedDistrict, setDoubleClickedDistrict] = useInputState<number | undefined>(undefined);

    const handleDistrictClick = React.useCallback((districtId: number) => {
        onDistrictsChange((prevDistricts) => {
            if (!prevDistricts) {
                return [districtId] as DV[];
            }

            const existingDistrictIndex = prevDistricts.findIndex(
                (prevDistrict) => prevDistrict === districtId
            );

            if (existingDistrictIndex === -1) {
                return [
                    ...prevDistricts,
                    districtId,
                ] as DV[];
            }

            const newDistricts = [...prevDistricts] as DV[];
            newDistricts.splice(existingDistrictIndex, 1);

            return newDistricts;
        });
    }, [onDistrictsChange]);

    const handleAdmin2Click = React.useCallback((admin2Id: number) => {
        onAdmin2sChange((prevAdmin2s) => {
            if (!prevAdmin2s) {
                return [admin2Id] as AV[];
            }
            const existingDistrictIndex = prevAdmin2s?.findIndex((prevAdmin2) => prevAdmin2 === admin2Id) ?? -1;

            if (existingDistrictIndex === -1) {
                return [
                    ...prevAdmin2s,
                    admin2Id,
                ] as AV[];
            }

            const newDistricts = [...prevAdmin2s] as AV[];
            newDistricts.splice(existingDistrictIndex, 1);

            return newDistricts;
        });
    }, [onAdmin2sChange]);

    const handleDistrictDoubleClick = React.useCallback((districtId: number) => {
        setDoubleClickedDistrict(districtId);
        onDistrictsChange((prevDistricts) => {
            if (!prevDistricts) {
                return [districtId] as DV[];
            }

            const existingDistrictIndex = prevDistricts.findIndex(
                (prevDistrict) => prevDistrict === districtId
            );

            if (existingDistrictIndex === -1) {
                return [
                    ...prevDistricts,
                    districtId,
                ] as DV[];
            }

            return prevDistricts;
        });
    }, [onDistrictsChange, setDoubleClickedDistrict]);

    const {
        pending: fetchingDistricts,
        response: districtsResponse,
    } = useRequest<ListResponse<District>>({
        url: 'api/v2/district/',
        query: {
            country: countryDetails.id,
        },
    });

    const districtOptions = React.useMemo(() => {
        if (!districtsResponse) {
            return [];
        }

        return districtsResponse.results.filter(
            (district) => !district.is_deprecated
        ).map(
        (district) => ({
            value: district.id,
            label: district.name,
        })
        );
    }, [districtsResponse]);

    const districtIdToNameMap = React.useMemo(() => {
        return listToMap(
            districtsResponse?.results ?? [],
            (d) => d.id,
            (d) => d.name,
        );
    }, [districtsResponse]);

    const {
        pending: fetchingAdmin2,
        response: admin2Response,
    } = useRequest<ListResponse<Admin2>>({
        url: 'api/v2/admin2/',
        query: {
            admin1__country: countryDetails.id,
            limit: 10000,
        },
    });

    // NOTE: Now map is always double clickable to see admin2
    // const hasAdmin2s = (admin2Response?.results ?? []).length > 0;

    const admin2IdToLabelMap = React.useMemo(() => {
        return listToMap(
            admin2Response?.results ?? [],
            (admin2) => admin2.id,
            (admin2) => admin2.name,
        );
    }, [admin2Response]);

    const admin2ToDistrictMap = React.useMemo(() => {
        return listToMap(
            admin2Response?.results ?? [],
            (admin2) => admin2.id,
            (admin2) => admin2.district_id,
        );
    }, [admin2Response]);

    const bounds = React.useMemo(
        () => {
            if (!countryDetails) {
                return undefined;
            }

            if (doubleClickedDistrict && districtsResponse) {
                const selectedDistrict = districtsResponse.results.find((d) => d.id === doubleClickedDistrict);
                if (selectedDistrict) {
                    return turfBbox(selectedDistrict.bbox) as BoundingBox;
                }
            }

            return turfBbox(countryDetails.bbox) as BoundingBox;
        }, [doubleClickedDistrict, districtsResponse, countryDetails],
    );

    const pending = fetchingAdmin2 && fetchingDistricts;

    return (
        <BasicModal
            className={_cs(styles.modal, className)}
            onCloseButtonClick={onCloseButtonClick}
            heading={countryDetails.name}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={onSaveButtonClick}
                >
                    Save
                </Button>
            )}
        >
            {pending && <BlockLoading />}
            {!pending &&(
                <Container
                    heading={doubleClickedDistrict ? districtIdToNameMap[doubleClickedDistrict] : "Select affected areas"}
                    headingSize="superSmall"
                    className={styles.modalContent}
                    headerClassName={styles.secondaryHeader}
                    description="Click on Admin 1 to select it. Double click to zoom into Admin 2"
                    icons={doubleClickedDistrict && (
                        <Button
                            icons={<IoChevronBack />}
                            name={undefined}
                            onClick={setDoubleClickedDistrict}
                            variant="tertiary"
                        >
                            Back to Country
                        </Button>
                    )}
                    descriptionClassName={styles.mapDescription}
                    contentClassName={styles.mainContent}
                    compact
                    sub
                >
                    <div className={styles.mapContainer}>
                        <Map
                            mapStyle={defaultMapStyle}
                            mapOptions={mapOptions}
                        >
                            <MapContainer className={styles.mapContent} />
                            <GoMapDisclaimer className={styles.mapDisclaimer} />
                            {doubleClickedDistrict && countryDetails.iso3 && (
                                <MapAdmin2Select
                                    countryIso={countryDetails.iso3}
                                    districtId={doubleClickedDistrict}
                                    selectedAdmin2s={admin2s}
                                    onClick={handleAdmin2Click}
                                />
                            )}
                            {!doubleClickedDistrict && (
                                <MapDistrictSelect
                                    selectedDistricts={districts}
                                    onClick={handleDistrictClick}
                                    countryId={countryDetails.id}
                                    onDoubleClick={handleDistrictDoubleClick}
                                />
                            )}
                            {bounds &&
                                <MapBounds
                                    padding={mapPadding}
                                    bounds={bounds}
                                />
                            }
                        </Map>
                    </div>
                    <div className={styles.sideBar}>
                        <SelectInput<undefined, DV>
                            className={styles.districtInput}
                            placeholder="Select Districts"
                            name={undefined}
                            options={districtOptions}
                            value={districts}
                            onChange={onDistrictsChange}
                            hideValue
                            isMulti
                            />
                        <FilterOutput
                            className={styles.output}
                            districtOptions={districtOptions}
                            districts={districts}
                            onDistrictsChange={onDistrictsChange}
                            admin2s={admin2s}
                            admin2IdToLabelMap={admin2IdToLabelMap}
                            onAdmin2sChange={onAdmin2sChange}
                            admin2ToDistrictMap={admin2ToDistrictMap}
                            doubleClickedDistrict={doubleClickedDistrict}
                        />
                        </div>
                        </Container>
            )}
                    </BasicModal>
    );
}

export default RegionSelectionModal;
