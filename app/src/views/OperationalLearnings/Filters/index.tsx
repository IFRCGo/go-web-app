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
    startDateBefore: string,
    sector: SecondarySector['key'],
    component: PerComponent['id'],
    startDate: string,
    search: string;
}>

export type SelectedFilter = Partial<{
    region: string,
    country: string,
    disasterType: string,
    startDateBefore: string,
    sector: string,
    component: string,
    startDate: string,
    search: string;
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

    const [primarySectorOptions, primarySectorOptionsPending] = useSecondarySector();
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

    const handleSectorSelect = useCallback((
        newValue: SecondarySector['key'] | undefined,
        key: 'sector',
        selectedSector: SecondarySector | undefined,
    ) => {
        onChange(newValue, key, selectedSector?.label);
    }, [onChange]);

    const handleComponentSelect = useCallback((
        newValue: PerComponent['id'] | undefined,
        key: 'component',
        selectedComponent: PerComponent | undefined,
    ) => {
        onChange(
            newValue,
            key,
            isDefined(selectedComponent) ? getFormattedComponentName(selectedComponent) : undefined,
        );
    }, [onChange]);

    return (
        <>
            <RegionSelectInput
                placeholder={strings.filterRegionsPlaceholder}
                name="region"
                value={value.region}
                onChange={handleRegionSelect}
                disabled={disabled}
            />
            <CountrySelectInput
                placeholder={strings.filterCountryPlaceholder}
                name="country"
                value={value.country}
                regionId={value.region}
                onChange={handleCountrySelect}
                disabled={disabled}
            />
            <DisasterTypeSelectInput
                placeholder={strings.filterDisasterTypePlaceholder}
                name="disasterType"
                value={value.disasterType}
                onChange={handleDisasterTypeSelect}
                disabled={disabled}
            />
            <SelectInput
                placeholder={strings.filterBySectorPlaceholder}
                name="sector"
                keySelector={sectorKeySelector}
                labelSelector={sectorLabelSelector}
                options={primarySectorOptions}
                optionsPending={primarySectorOptionsPending}
                disabled={primarySectorOptionsPending || disabled}
                value={value.sector}
                onChange={handleSectorSelect}

            />
            <SelectInput
                placeholder={strings.filterByComponentPlaceholder}
                name="component"
                options={perComponentOptions}
                keySelector={perComponentKeySelector}
                labelSelector={getFormattedComponentName}
                disabled={perComponentOptionsPending || disabled}
                value={value.component}
                onChange={handleComponentSelect}
            />
            <DateInput
                name="startDateBefore"
                onChange={onChange}
                value={value.startDate}
                disabled={disabled}
            />
            <TextInput
                name="search"
                placeholder={strings.filterOpsLearningsSearchPlaceholder}
                value={value.search}
                onChange={onChange}
                icons={<SearchLineIcon />}
                disabled={disabled}
            />
        </>
    );
}

export default Filters;
