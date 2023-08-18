import { useCallback, useState } from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    type SetValueArg,
    useFormObject,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';

import IconButton from '#components/IconButton';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import useTranslation from '#hooks/useTranslation';
import DistrictSearchMultiSelectInput, {
    type DistrictItem,
} from '#components/domain/DistrictSearchMultiSelectInput';

import i18n from './i18n.json';
import { PartialCountryDistrict } from '../../schema';

import styles from './styles.module.css';

interface Props {
    value: PartialCountryDistrict;
    error: ArrayError<PartialCountryDistrict> | undefined;
    onChange: (value: SetValueArg<PartialCountryDistrict>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}

function CountryProvinceInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
    } = props;
    const strings = useTranslation(i18n);

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);

    const setFieldValue = useFormObject(index, onChange, () => ({
        client_id: randomString(),
    }));
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const handleCountryChange = useCallback((newValue: number | undefined) => {
        onChange((oldVal) => ({
            ...oldVal,
            client_id: oldVal?.client_id ?? randomString(),
            country: newValue,
            district: [],
        }), index);
    }, [onChange, index]);

    return (
        <div className={styles.countryDistrictInput}>
            <CountrySelectInput
                error={error?.country}
                label={strings.flashUpdateFormContextCountryLabel}
                name="country"
                onChange={handleCountryChange}
                value={value.country}
            />
            <DistrictSearchMultiSelectInput
                error={getErrorString(error?.district)}
                label={strings.flashUpdateFormContextProvinceLabel}
                name="district"
                countryId={value?.country}
                onChange={setFieldValue}
                options={districtOptions}
                onOptionsChange={setDistrictOptions}
                value={value.district}
            />
            <IconButton
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                // FIXME: Use translations
                title="Remove"
                // FIXME: Use translations
                ariaLabel="Remove"
                variant="tertiary"
                disabled={index === 0}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default CountryProvinceInput;
