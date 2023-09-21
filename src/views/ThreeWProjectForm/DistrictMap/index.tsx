import { useCallback, useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
import Button from '#components/Button';

import List from '#components/List';
import TextOutput from '#components/TextOutput';
import useBooleanState from '#hooks/useBooleanState';
import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import { numericIdSelector } from '#utils/selectors';

import DistrictMapModal, { type Props as MapModalProps } from './DistrictMapModal';
import styles from './styles.module.css';

interface AdminTwo {
    id: number;
    name: string;
    district_id: number;
}

export interface DistrictWithAdminTwo extends DistrictItem {
    localUnits: AdminTwo[];
}

type Props<NAME, ADMIN2_NAME> = Omit<MapModalProps<NAME, ADMIN2_NAME>, 'countryId' | 'onModalClose'> & {
    countryId: number | undefined;
    className?: string;
};

function DistrictMap<
    const NAME,
    const ADMIN2_NAME,
>(props: Props<NAME, ADMIN2_NAME>) {
    const {
        className,
        countryId,
        disabled,
        admin2Value,
        districtsValue,
        admin2Options,
        districtOptions,
        ...otherProps
    } = props;

    const [
        modalShown,
        {
            setTrue: showModal,
            setFalse: hideModal,
        },
    ] = useBooleanState(false);

    const selectedAdminTwo = useMemo(() => (
        admin2Value
            ?.map((adminTwoId) => admin2Options?.find((adminTwo) => adminTwo.id === adminTwoId))
            .filter(isDefined)
    ), [admin2Options, admin2Value]);

    const selectedDistricts = useMemo(() => (
        districtsValue
            ?.map((districtId) => districtOptions?.find((district) => district.id === districtId))
            ?.filter(isDefined)
            .map((district) => ({
                ...district,
                localUnits: selectedAdminTwo
                    ?.filter((adminTwo) => adminTwo.district_id === district.id),
            }))
    ), [districtOptions, selectedAdminTwo, districtsValue]);

    const districtRendererParams = useCallback((_: number, data: DistrictWithAdminTwo) => ({
        value: data.name,
        strongValue: true,
        className: styles.districtList,
        descriptionClassName: styles.localUnits,
        description: data.localUnits?.map((adminTwo) => adminTwo.name).join(', '),
    }), []);

    return (
        <>
            <Button
                className={className}
                name={undefined}
                disabled={!countryId || disabled}
                onClick={showModal}
                variant="tertiary"
            >
                {/* FIXME: Use translations */}
                Select Province / Region
            </Button>
            <List
                data={selectedDistricts}
                rendererParams={districtRendererParams}
                renderer={TextOutput}
                keySelector={numericIdSelector}
                withoutMessage
                compact
                pending={false}
                errored={false}
                filtered={false}
            />
            {modalShown && countryId && (
                <DistrictMapModal
                    countryId={countryId}
                    disabled={disabled}
                    admin2Options={admin2Options}
                    admin2Value={admin2Value}
                    districtsValue={districtsValue}
                    districtOptions={districtOptions}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    onModalClose={hideModal}
                />
            )}
        </>
    );
}

export default DistrictMap;
