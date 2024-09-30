import { useCallback } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    DateInput,
    MultiSelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    EntriesAsList,
    SetValueArg,
} from '@togglecorp/toggle-form';

import CountryMultiSelectInput, { type CountryOption } from '#components/domain/CountryMultiSelectInput';
import RegionSelectInput, { type RegionOption } from '#components/domain/RegionSelectInput';
import { DisasterType } from '#hooks/domain/useDisasterType';
import { type PerComponent } from '#hooks/domain/usePerComponent';
import { type SecondarySector } from '#hooks/domain/useSecondarySector';
import { getFormattedComponentName } from '#utils/domain/per';

import i18n from './i18n.json';

const sectorKeySelector = (d: SecondarySector) => d.key;
const sectorLabelSelector = (d: SecondarySector) => d.label;
const perComponentKeySelector = (option: PerComponent) => option.id;
const disasterTypeKeySelector = (type: DisasterType) => type.id;
const disasterTypeLabelSelector = (type: DisasterType) => type.name ?? '?';

export type FilterValue = Partial<{
    region: RegionOption['key'],
    countries: CountryOption['id'][],
    disasterTypes: DisasterType['id'][],
    secondarySectors: SecondarySector['key'][],
    perComponents: PerComponent['id'][],
    appealStartDateAfter: string,
    appealStartDateBefore: string,
    appealSearchText: string;
}>

export type FilterLabel = Partial<{
    [key in keyof FilterValue]: string;
}>

export type EntriesAsListWithString<T> = {
    [K in keyof T]-?: [
        SetValueArg<T[K]>,
        K,
        string | null | undefined,
        ...unknown[]
    ];
}[keyof T];

interface Props {
    value: FilterValue;
    onChange: (...value: EntriesAsList<FilterValue>) => void;
    disasterTypeOptions: DisasterType[] | undefined;
    secondarySectorOptions: SecondarySector[] | undefined;
    perComponentOptions: PerComponent[] | undefined;
    secondarySectorOptionsPending: boolean;
    perComponentOptionsPending: boolean;
    disabled?: boolean;
}
function Filters(props: Props) {
    const {
        value,
        onChange,
        disasterTypeOptions,
        secondarySectorOptions,
        perComponentOptions,
        secondarySectorOptionsPending,
        perComponentOptionsPending,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const handleRegionSelect = useCallback((
        newValue: RegionOption['key'] | undefined,
        key: 'region',
        selectedRegion: RegionOption | undefined,
    ) => {
        onChange(newValue, key, selectedRegion?.value);

        if (value.region !== newValue) {
            onChange(undefined, 'countries', undefined);
        }
    }, [onChange, value.region]);

    return (
        <>
            <RegionSelectInput
                name="region"
                label={strings.filterRegionsLabel}
                placeholder={strings.filterRegionsPlaceholder}
                value={value.region}
                onChange={handleRegionSelect}
                disabled={disabled}
            />
            <CountryMultiSelectInput
                name="countries"
                label={strings.filterCountryLabel}
                placeholder={strings.filterCountryLabel}
                value={value.countries}
                onChange={onChange}
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
                withSelectAll
            />
            <DateInput
                name="appealStartDateAfter"
                label={strings.appealStartDate}
                onChange={onChange}
                value={value.appealStartDateAfter}
                disabled={disabled}
            />
            <DateInput
                name="appealStartDateBefore"
                label={strings.appealEndDate}
                onChange={onChange}
                value={value.appealStartDateBefore}
                disabled={disabled}
            />
            <TextInput
                name="appealSearchText"
                label={strings.filterOpsLearningSearchLabel}
                placeholder={strings.filterOpsLearningSearchPlaceholder}
                value={value.appealSearchText}
                onChange={onChange}
                icons={<SearchLineIcon />}
                disabled={disabled}
            />
        </>
    );
}

export default Filters;
