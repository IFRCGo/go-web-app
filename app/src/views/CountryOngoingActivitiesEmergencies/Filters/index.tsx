import { useCallback } from 'react';
import {
    Button,
    DateInput,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import type { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;

interface FilterValue {
    appeal?: 0 | 1 | 2 | 3 | undefined;
    district?: number[] | undefined;
    displacement?: number | undefined;
    startDateAfter?: string | undefined;
    startDateBefore?: string | undefined;
}

interface Props {
    value: FilterValue;
    onChange: (...args: EntriesAsList<FilterValue>) => void;
    setFilter: React.Dispatch<React.SetStateAction<FilterValue>>;
    filtered?: boolean;
}

function Filters(props: Props) {
    const {
        value,
        onChange,
        setFilter,
        filtered,
    } = props;

    const strings = useTranslation(i18n);
    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();

    const handleClearFiltersButtonClick = useCallback(() => {
        setFilter({});
    }, [setFilter]);

    return (
        <>
            <DateInput
                name="startDateAfter"
                label={strings.appealsStartDateAfter}
                onChange={onChange}
                value={value.startDateAfter}
            />
            <DateInput
                name="startDateBefore"
                label={strings.appealsStartDateBefore}
                onChange={onChange}
                value={value.startDateBefore}
            />
            <SelectInput
                placeholder={strings.appealsFilterTypePlaceholder}
                label={strings.appealsTypeLabel}
                name="appeal"
                value={value.appeal}
                onChange={onChange}
                keySelector={appealTypeKeySelector}
                labelSelector={appealTypeLabelSelector}
                options={appealTypeOptions}
            />
            <DisasterTypeSelectInput
                placeholder={strings.appealsFilterDisastersPlaceholder}
                label={strings.appealsDisasterType}
                name="displacement"
                value={value.displacement}
                onChange={onChange}
            />
            <div className={styles.clearFilter}>
                <Button
                    name={undefined}
                    className={styles.clearFilter}
                    onClick={handleClearFiltersButtonClick}
                    variant="secondary"
                    disabled={!filtered}
                >
                    {strings.operationMapClearFilters}
                </Button>
            </div>
        </>
    );
}

export default Filters;
