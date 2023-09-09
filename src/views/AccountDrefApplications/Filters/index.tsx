import { useCallback } from 'react';
import { EntriesAsList } from '@togglecorp/toggle-form';

import TextInput from '#components/TextInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import SelectInput from '#components/SelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { stringValueSelector } from '#utils/selectors';
import { type components } from '#generated/types';

import i18n from './i18n.json';

type TypeOfDref = components<'read'>['schemas']['TypeOfDrefEnum'];
function typeOfDrefKeySelector({ key } : { key: TypeOfDref }) {
    return key;
}

export interface FilterValue {
    country?: number | undefined;
    type_of_dref?: TypeOfDref | undefined;
    disaster_type?: number | undefined;
    appeal_code?: string | undefined;
}

interface Props {
    value: FilterValue;
    onChange: (...args: EntriesAsList<FilterValue>) => void;
}

function Filters(props: Props) {
    const {
        value,
        onChange,
    } = props;

    const strings = useTranslation(i18n);
    const { dref_dref_dref_type: drefTypeOptions } = useGlobalEnums();

    return (
        <>
            <CountrySelectInput
                name="country"
                value={value.country}
                onChange={onChange}
                placeholder={strings.filterCountryPlaceholder}
            />
            <SelectInput
                name="type_of_dref"
                placeholder={strings.filterTypeOfDrefPlaceholder}
                options={drefTypeOptions}
                keySelector={typeOfDrefKeySelector}
                labelSelector={stringValueSelector}
                value={value.type_of_dref}
                onChange={onChange}
            />
            <DisasterTypeSelectInput
                name="disaster_type"
                placeholder={strings.filterDisasterTypePlaceholder}
                value={value.disaster_type}
                onChange={onChange}
            />
            <TextInput
                name="appeal_code"
                placeholder={strings.filterAppealCodePlaceholder}
                value={value.appeal_code}
                onChange={onChange}
            />
        </>
    );
}

export default Filters;
