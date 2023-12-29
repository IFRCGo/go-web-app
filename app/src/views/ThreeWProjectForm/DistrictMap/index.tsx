import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    List,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';

import DistrictMapModal, { type Props as MapModalProps } from './DistrictMapModal';

import i18n from './i18n.json';
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
    const strings = useTranslation(i18n);

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
        <div className={styles.input}>
            <Button
                className={className}
                name={undefined}
                disabled={!countryId || disabled}
                onClick={showModal}
                variant="secondary"
            >
                {strings.buttonSelectProvince}
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
        </div>
    );
}

export default DistrictMap;
