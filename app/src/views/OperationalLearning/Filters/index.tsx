import {
    useCallback,
    useState,
} from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    DateInput,
    MultiSelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringNameSelector } from '@ifrc-go/ui/utils';
import {
    EntriesAsList,
    SetValueArg,
} from '@togglecorp/toggle-form';

import { type DisasterTypeItem } from '#components/domain/DisasterTypeSelectInput';
import RegionSelectInput, { type RegionOption } from '#components/domain/RegionSelectInput';
import useCountry, { Country } from '#hooks/domain/useCountry';
import useDisasterTypes, { DisasterType } from '#hooks/domain/useDisasterType';
import usePerComponent, { type PerComponent } from '#hooks/domain/usePerComponent';
import useSecondarySector, { type SecondarySector } from '#hooks/domain/useSecondarySector';
import { getFormattedComponentName } from '#utils/domain/per';

import i18n from './i18n.json';

const sectorKeySelector = (d: SecondarySector) => d.key;
const sectorLabelSelector = (d: SecondarySector) => d.label;
const perComponentKeySelector = (option: PerComponent) => option.id;
const countryKeySelector = (country: Country) => country.iso3;
const disasterTypeKeySelector = (type: DisasterTypeItem) => type.id;
const disasterTypeLabelSelector = (type: DisasterTypeItem) => type.name ?? '?';

export type FilterValue = Partial<{
    region: RegionOption['key'],
    countries: string[],
    disasterTypes: DisasterTypeItem['id'][],
    secondarySectors: SecondarySector['key'][],
    perComponents: PerComponent['id'][],
    appealStartDateAfter: string,
    appealStartDateBefore: string,
    appealSearchText: string;
}>

type SelectedOptions = {
    countries: Country[] | null | undefined;
    disasterTypes: DisasterType[] | null | undefined;
    secondarySectors: SecondarySector[] | null | undefined;
    perComponents: PerComponent[] | null | undefined;
};

export type FilterLabel = Partial<{
    [key in keyof FilterValue]: string;
}>

export type EntriesAsListWithString<T> = {
    [K in keyof T]-?: [SetValueArg<T[K]>, K, string | null | undefined, ...unknown[]];
}[keyof T];

interface Props {
    value: FilterValue;
    onChange: (...value: EntriesAsList<FilterValue>) => void;
    // onChange: (...value: EntriesAsListWithString<FilterValue>) => void;
    disabled?: boolean;
}
function Filters(props: Props) {
    const {
        value,
        onChange,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
        countries: null,
        disasterTypes: null,
        secondarySectors: null,
        perComponents: null,
    });

    const [secondarySectorOptions, secondarySectorOptionsPending] = useSecondarySector();
    const [perComponentOptions, perComponentOptionsPending] = usePerComponent();

    const handleOptionChange = useCallback(<K extends keyof SelectedOptions>(
        newValue: React.SetStateAction<SelectedOptions[K]>,
        name: K,
    ) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [name]: typeof newValue === 'function'
                ? newValue(prev[name])
                : newValue,
        }));
    }, []);

    const handleStartDateSelect = useCallback((
        newValue: string | undefined,
        key: 'appealStartDateAfter',
    ) => {
        onChange(
            newValue,
            key,
            newValue,
        );
    }, [onChange]);

    const handleEndDateSelect = useCallback((
        newValue: string | undefined,
        key: 'appealStartDateBefore',
    ) => {
        onChange(
            newValue,
            key,
            newValue,
        );
    }, [onChange]);

    const handleSearch = useCallback((
        newValue: string | undefined,
        key: 'appealSearchText',
    ) => {
        onChange(
            newValue,
            key,
            undefined,
        );
    }, [onChange]);

    const countryList = useCountry({ region: value.region });

    const disasterTypeOptions = useDisasterTypes();

    return (
        <>
            <RegionSelectInput
                name="region"
                label={strings.filterRegionsLabel}
                placeholder={strings.filterRegionsPlaceholder}
                value={value.region}
                onChange={onChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="countries"
                label={strings.filterCountryLabel}
                placeholder={strings.filterCountryLabel}
                options={countryList}
                keySelector={countryKeySelector}
                labelSelector={stringNameSelector}
                value={value.countries}
                onChange={onChange}
                onOptionsChange={(newValue) => handleOptionChange(newValue, 'countries')}
                withSelectAll
            />
            <MultiSelectInput
                name="disasterTypes"
                label={strings.filterDisasterTypePlaceholder}
                placeholder={strings.filterDisasterTypePlaceholder}
                options={disasterTypeOptions}
                keySelector={disasterTypeKeySelector}
                labelSelector={disasterTypeLabelSelector}
                value={value.disasterTypes}
                onChange={onChange}
                onOptionsChange={(newValue) => handleOptionChange(newValue, 'disasterTypes')}
                withSelectAll
            />
            <MultiSelectInput
                name="secondarySectors"
                label={strings.filterBySectorLabel}
                placeholder={strings.filterBySectorPlaceholder}
                options={secondarySectorOptions}
                keySelector={sectorKeySelector}
                labelSelector={sectorLabelSelector}
                optionsPending={secondarySectorOptionsPending}
                disabled={secondarySectorOptionsPending || disabled}
                value={value.secondarySectors}
                onChange={onChange}
                onOptionsChange={(newValue) => handleOptionChange(newValue, 'secondarySectors')}
                withSelectAll
            />
            <MultiSelectInput
                name="perComponents"
                label={strings.filterByComponentLabel}
                placeholder={strings.filterByComponentPlaceholder}
                options={perComponentOptions}
                keySelector={perComponentKeySelector}
                labelSelector={getFormattedComponentName}
                disabled={perComponentOptionsPending || disabled}
                value={value.perComponents}
                onChange={onChange}
                onOptionsChange={(newValue) => handleOptionChange(newValue, 'perComponents')}
                withSelectAll
            />
            <DateInput
                name="appealStartDateAfter"
                label={strings.appealStartDate}
                onChange={handleStartDateSelect}
                value={value.appealStartDateAfter}
                disabled={disabled}
            />
            <DateInput
                name="appealStartDateBefore"
                label={strings.appealEndDate}
                onChange={handleEndDateSelect}
                value={value.appealStartDateBefore}
                disabled={disabled}
            />
            <TextInput
                name="appealSearchText"
                label={strings.filterOpsLearningSearchLabel}
                placeholder={strings.filterOpsLearningSearchPlaceholder}
                value={value.appealSearchText}
                onChange={handleSearch}
                icons={<SearchLineIcon />}
                disabled={disabled}
            />
        </>
    );
}

export default Filters;
