import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    ListView,
    SelectInput,
} from '@ifrc-go/ui';
import { LanguageContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    stringLabelSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';

import {
    DEFAULT_MONTH,
    getCurrentYear,
    getFullDateValue,
    getMonthOptions,
    getYearMonthParts,
    getYearOptions,
} from './utils';

import i18n from './i18n.json';

interface Props<NAME extends string> {
    className?: string;
    name: NAME;
    value: string | undefined | null;
    onChange: (value: string | undefined, name: NAME) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function EapMonthYearInput<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);
    const { currentLanguage } = useContext(LanguageContext);

    // NOTE: the value is atomic, both selects derive from it so they can never
    // hold a selection the form does not know about. Picking one field therefore
    // has to complete the other, see the defaults in the change handlers below.
    const selectedParts = getYearMonthParts(value);
    const selectedMonth = selectedParts?.month;
    const selectedYear = selectedParts?.year;

    const currentYear = getCurrentYear();

    const monthOptions = useMemo(
        () => getMonthOptions(currentLanguage),
        [currentLanguage],
    );

    const yearOptions = useMemo(
        () => getYearOptions(currentYear, selectedYear),
        [currentYear, selectedYear],
    );

    const handleMonthChange = useCallback((newMonth: string) => {
        onChange(
            getFullDateValue(selectedYear ?? String(currentYear), newMonth),
            name,
        );
    }, [onChange, name, selectedYear, currentYear]);

    const handleYearChange = useCallback((newYear: string) => {
        onChange(
            getFullDateValue(newYear, selectedMonth ?? DEFAULT_MONTH),
            name,
        );
    }, [onChange, name, selectedMonth]);

    return (
        <ListView className={className}>
            <SelectInput
                nonClearable
                name="month"
                placeholder={strings.monthPlaceHolder}
                value={selectedMonth}
                onChange={handleMonthChange}
                options={monthOptions}
                keySelector={stringValueSelector}
                labelSelector={stringLabelSelector}
                disabled={disabled}
                readOnly={readOnly}
            />
            <SelectInput
                nonClearable
                name="year"
                placeholder={strings.yearPlaceHolder}
                value={selectedYear}
                onChange={handleYearChange}
                options={yearOptions}
                keySelector={stringValueSelector}
                labelSelector={stringLabelSelector}
                disabled={disabled}
                readOnly={readOnly}
            />
        </ListView>
    );
}

export default EapMonthYearInput;
