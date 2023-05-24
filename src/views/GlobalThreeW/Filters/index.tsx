import React from 'react';
import { _cs } from '@togglecorp/fujs';

import MultiSelectInput from '#components/MultiSelectInput';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

const emptyList: {
    value: number;
    label: string;
}[] = [];

export interface FilterValue {
    reporting_ns: number[];
    programme_type: number[];
    primary_sector: number[];
    secondary_sectors: number[];
}

interface Props {
    className?: string;
    value: FilterValue;
    onChange: React.Dispatch<React.SetStateAction<FilterValue>>;
    disabled?: boolean;
}

function Filters(props: Props) {
    const {
        className,
        value,
        onChange,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const handleInputChange = React.useCallback((newValue: number[], name: string) => {
        if (onChange) {
            onChange((oldFilterValue) => {
                const newFilterValue = {
                    ...oldFilterValue,
                    [name]: newValue,
                };

                return newFilterValue;
            });
        }
    }, [onChange]);

    return (
        <div className={_cs(styles.filters, className)}>
            <MultiSelectInput
                name="reporting_ns"
                placeholder={strings.threeWFilterReportingNs}
                options={emptyList}
                value={value.reporting_ns}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="programme_type"
                placeholder={strings.threeWFilterProgrammeTypes}
                options={emptyList}
                value={value.programme_type}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="primary_sector"
                placeholder={strings.threeWFilterSectors}
                options={emptyList}
                value={value.primary_sector}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="secondary_sectors"
                placeholder={strings.threeWFilterTags}
                options={emptyList}
                value={value.secondary_sectors}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                onChange={handleInputChange}
                disabled={disabled}
            />
        </div>
    );
}

export default Filters;
