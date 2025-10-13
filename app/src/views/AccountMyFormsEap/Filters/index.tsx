import { SelectInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import i18n from './i18n.json';

type TypeOfEapStatus = components<'read'>['schemas']['EapEapStatusEnumKey'];
function typeOfEapStatusKeySelector({ key } : { key: TypeOfEapStatus }) {
    return key;
}

export interface FilterValue {
    status?: TypeOfEapStatus | undefined;
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
    const { eap_eap_status: eapStatusTypeOptions } = useGlobalEnums();

    return (
        <SelectInput
            name="status"
            placeholder={strings.filterStatusPlaceholder}
            options={eapStatusTypeOptions}
            keySelector={typeOfEapStatusKeySelector}
            labelSelector={stringValueSelector}
            value={value.status}
            onChange={onChange}
        />
    );
}

export default Filters;
