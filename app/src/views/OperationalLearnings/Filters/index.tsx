import { useCallback } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    DateInput,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import CountrySelectInput, { type CountryOption } from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput, { type DisasterTypeItem } from '#components/domain/DisasterTypeSelectInput';
import RegionSelectInput, { type RegionOption } from '#components/domain/RegionSelectInput';
import usePerComponent, { type PerComponent } from '#hooks/domain/usePerComponent';
import useRegion from '#hooks/domain/useRegion';
import useSecondarySector, { type SecondarySector } from '#hooks/domain/useSecondarySector';
import { getFormattedComponentName } from '#utils/domain/per';

import i18n from './i18n.json';

const sectorKeySelector = (d: SecondarySector) => d.key;
const sectorLabelSelector = (d: SecondarySector) => d.label;
const perComponentKeySelector = (option: PerComponent) => option.id;

export type FilterValue = Partial<{
    region: RegionOption['key'],
    country: CountryOption['id'],
    disasterType: DisasterTypeItem['id'],
    secondarySector: SecondarySector['key'],
    perComponent: PerComponent['id'],
    appealStartDateAfter: string,
    appealStartDateBefore: string,
    appealSearchText: string;
}>

export type FilterLabel = Partial<{
    [key in keyof FilterValue]: string;
}>

interface Props {
    value: FilterValue;
    onChange: (...value: EntriesAsList<FilterValue>) => void;
    disabled?: boolean;
}
function Filters(props: Props) {
    const {
        value,
        onChange,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const regions = useRegion();

    const [secondarySectorOptions, secondarySectorOptionsPending] = useSecondarySector();
    const [perComponentOptions, perComponentOptionsPending] = usePerComponent();

    const handleRegionSelect = useCallback((
        newValue: RegionOption['key'] | undefined,
        key: 'region',
        selectedRegion: RegionOption | undefined,
    ) => {
        onChange(newValue, key, selectedRegion?.value);
        onChange(undefined, 'country', undefined);
    }, [onChange]);

    const handleCountrySelect = useCallback((
        newValue: CountryOption['id'] | undefined,
        key: 'country',
        selectedCountry: CountryOption | undefined,
    ) => {
        if (isDefined(newValue)) {
            const countryRegion = regions?.find((region) => region.id === selectedCountry?.region);
            onChange(
                selectedCountry?.region as RegionOption['key'],
                'region',
                countryRegion?.region_name,
            );
        }
        onChange(newValue, key, selectedCountry?.name);
    }, [onChange, regions]);

    const handleDisasterTypeSelect = useCallback((
        newValue: DisasterTypeItem['id'] | undefined,
        key: 'disasterType',
        selectedDisasterType: DisasterTypeItem | undefined,
    ) => {
        onChange(newValue, key, selectedDisasterType?.name);
    }, [onChange]);

    const handleSecondarySectorSelect = useCallback((
        newValue: SecondarySector['key'] | undefined,
        key: 'secondarySector',
        selectedSector: SecondarySector | undefined,
    ) => {
        onChange(newValue, key, selectedSector?.label);
    }, [onChange]);

    const handleComponentSelect = useCallback((
        newValue: PerComponent['id'] | undefined,
        key: 'perComponent',
        selectedComponent: PerComponent | undefined,
    ) => {
        onChange(
            newValue,
            key,
            isDefined(selectedComponent) ? getFormattedComponentName(selectedComponent) : undefined,
        );
    }, [onChange]);

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
        );
    }, [onChange]);

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
            <CountrySelectInput
                name="country"
                label={strings.filterCountryLabel}
                placeholder={strings.filterCountryPlaceholder}
                value={value.country}
                regionId={value.region}
                onChange={handleCountrySelect}
                disabled={disabled}
            />
            <DisasterTypeSelectInput
                name="disasterType"
                label={strings.filterDisasterTypeLabel}
                placeholder={strings.filterDisasterTypePlaceholder}
                value={value.disasterType}
                onChange={handleDisasterTypeSelect}
                disabled={disabled}
            />
            <SelectInput
                name="secondarySector"
                label={strings.filterBySectorLabel}
                placeholder={strings.filterBySectorPlaceholder}
                keySelector={sectorKeySelector}
                labelSelector={sectorLabelSelector}
                options={secondarySectorOptions}
                optionsPending={secondarySectorOptionsPending}
                disabled={secondarySectorOptionsPending || disabled}
                value={value.secondarySector}
                onChange={handleSecondarySectorSelect}

            />
            <SelectInput
                name="perComponent"
                label={strings.filterByComponentLabel}
                placeholder={strings.filterByComponentPlaceholder}
                options={perComponentOptions}
                keySelector={perComponentKeySelector}
                labelSelector={getFormattedComponentName}
                disabled={perComponentOptionsPending || disabled}
                value={value.perComponent}
                onChange={handleComponentSelect}
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
                label={strings.filterOpsLearningsSearchLabel}
                placeholder={strings.filterOpsLearningsSearchPlaceholder}
                value={value.appealSearchText}
                onChange={handleSearch}
                icons={<SearchLineIcon />}
                disabled={disabled}
            />
        </>
    );
}

export default Filters;
