import { useMemo } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Button,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    stringLabelSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type GoApiResponse } from '#utils/restRequest';

import {
    NOT_VALIDATED,
    VALIDATED,
    type Validation,
} from '../common';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface ValidationOption {
    key: Validation
    label: string;
}

export interface FilterValue {
    search?: string | undefined;
    type?: number | undefined;
    isValidated?: Validation | undefined;
}

type LocalUnitOptions = GoApiResponse<'/api/v2/local-units-options/'>;
type LocalUnitType = LocalUnitOptions['type'][number];

function localUnitCodeSelector(localUnit: LocalUnitType) {
    return localUnit.code;
}

function validationKeySelector(option: ValidationOption) {
    return option.key;
}

interface Props {
    value: FilterValue;
    setFieldValue: (...entries: EntriesAsList<FilterValue>) => void;
    options: LocalUnitOptions | undefined;
    resetFilter: () => void;
    filtered: boolean;
}

function Filters(props: Props) {
    const {
        value,
        setFieldValue: onChange,
        options,
        resetFilter,
        filtered,
    } = props;
    const strings = useTranslation(i18n);

    const validationOptions = useMemo((): ValidationOption[] => ([
        {
            key: VALIDATED,
            label: strings.validated,
        },
        {
            key: NOT_VALIDATED,
            label: strings.notValidated,
        },
    ]), [strings.validated, strings.notValidated]);

    return (
        <>
            <SelectInput
                placeholder={strings.localUnitsFilterTypePlaceholder}
                label={strings.localUnitsFilterTypeLabel}
                name="type"
                value={value.type}
                onChange={onChange}
                keySelector={localUnitCodeSelector}
                labelSelector={stringNameSelector}
                options={options?.type}
            />
            <SelectInput
                placeholder={strings.localUnitsFilterValidatedPlaceholder}
                label={strings.localUnitsFilterValidatedLabel}
                name="isValidated"
                value={value.isValidated}
                onChange={onChange}
                keySelector={validationKeySelector}
                labelSelector={stringLabelSelector}
                options={validationOptions}
            />
            <TextInput
                name="search"
                label={strings.localUnitsFilterSearchLabel}
                placeholder={strings.localUnitsFilterSearchPlaceholderLabel}
                value={value.search}
                onChange={onChange}
                icons={<SearchLineIcon />}
            />
            <div className={styles.actions}>
                <Button
                    name={undefined}
                    variant="secondary"
                    onClick={resetFilter}
                    disabled={!filtered}
                >
                    {strings.localUnitsFilterClear}
                </Button>
            </div>
        </>
    );
}

export default Filters;
