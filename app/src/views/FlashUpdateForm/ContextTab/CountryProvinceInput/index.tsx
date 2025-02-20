import {
    type Dispatch,
    type SetStateAction,
    useCallback,
} from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import { IconButton } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import NonFieldError from '#components/NonFieldError';

import { type PartialCountryDistrict } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    value: PartialCountryDistrict;
    // FIXME: Only pass error for this object
    error: ArrayError<PartialCountryDistrict> | undefined;
    onChange: (value: PartialCountryDistrict, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
}

function CountryProvinceInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        districtOptions,
        setDistrictOptions,
    } = props;

    const strings = useTranslation(i18n);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const handleCountryChange = useCallback((newValue: number | undefined) => {
        onChange({
            ...value,
            client_id: value?.client_id ?? randomString(),
            country: newValue,
            district: [],
        }, index);
    }, [
        value,
        onChange,
        index,
    ]);

    const handleDistrictChange = useCallback((newValue: number[] | undefined) => {
        onChange({
            ...value,
            client_id: value?.client_id ?? randomString(),
            district: newValue,
        }, index);
    }, [
        value,
        onChange,
        index,
    ]);

    return (
        <div className={styles.countryDistrictInput}>
            <NonFieldError error={error} />
            <CountrySelectInput
                error={error?.country}
                label={strings.flashUpdateFormContextCountryLabel}
                name="country"
                onChange={handleCountryChange}
                value={value.country}
                disabled={disabled}
                withAsterisk
            />
            <DistrictSearchMultiSelectInput
                error={getErrorString(error?.district)}
                label={strings.flashUpdateFormContextProvinceLabel}
                name="district"
                countryId={value?.country}
                onChange={handleDistrictChange}
                options={districtOptions}
                onOptionsChange={setDistrictOptions}
                value={value.district}
                disabled={disabled}
            />
            <IconButton
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                title={strings.flashUpdateRemove}
                ariaLabel={strings.flashUpdateRemove}
                variant="tertiary"
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default CountryProvinceInput;
