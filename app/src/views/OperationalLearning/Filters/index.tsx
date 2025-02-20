import { useCallback } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    DateInput,
    MultiSelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    numericKeySelector,
    stringLabelSelector,
    stringTitleSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import CountryMultiSelectInput, { type CountryOption } from '#components/domain/CountryMultiSelectInput';
import RegionSelectInput, { type RegionOption } from '#components/domain/RegionSelectInput';
import { type PerComponents } from '#contexts/domain';
import { type components } from '#generated/types';
import { type DisasterType } from '#hooks/domain/useDisasterType';
import { type SecondarySector } from '#hooks/domain/useSecondarySector';
import { getFormattedComponentName } from '#utils/domain/per';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

export type PerComponent = NonNullable<PerComponents['results']>[number];

type OpsLearningOrganizationType = NonNullable<GoApiResponse<'/api/v2/ops-learning/organization-type/'>['results']>[number];
export type PerLearningType = components<'read'>['schemas']['PerLearningTypeEnum'];

const disasterTypeLabelSelector = (disasterType: DisasterType) => disasterType.name ?? '?';

const perLearningTypeKeySelector = (perLearningType: PerLearningType) => perLearningType.key;

export type FilterValue = Partial<{
    region: RegionOption['key'],
    countries: CountryOption['id'][],
    disasterTypes: DisasterType['id'][],
    secondarySectors: SecondarySector['key'][],
    perComponents: PerComponent['id'][],
    organizationTypes: OpsLearningOrganizationType['id'][],
    perLearningTypes: PerLearningType['key'][],
    appealStartDateAfter: string,
    appealStartDateBefore: string,
    appealSearchText: string;
}>

interface Props {
    value: FilterValue;
    onChange: (...value: EntriesAsList<FilterValue>) => void;
    disasterTypeOptions: DisasterType[] | undefined;
    secondarySectorOptions: SecondarySector[] | undefined;
    perComponentOptions: PerComponent[] | undefined;
    organizationTypeOptions: OpsLearningOrganizationType[] | undefined,
    organizationTypePending: boolean;
    perLearningTypeOptions: PerLearningType[] | undefined;
    disabled?: boolean;
}

function Filters(props: Props) {
    const {
        value,
        onChange,
        disasterTypeOptions,
        secondarySectorOptions,
        perComponentOptions,
        organizationTypeOptions,
        organizationTypePending,
        perLearningTypeOptions,
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
                label={strings.filterRegionLabel}
                placeholder={strings.filterRegionPlaceholder}
                value={value.region}
                onChange={handleRegionSelect}
                disabled={disabled}
            />
            <CountryMultiSelectInput
                name="countries"
                label={strings.filterCountryLabel}
                placeholder={strings.filterCountryPlaceholder}
                value={value.countries}
                onChange={onChange}
                filterByRegion={value.region}
                withSelectAll
            />
            <MultiSelectInput
                name="disasterTypes"
                label={strings.filterDisasterTypeLabel}
                placeholder={strings.filterDisasterTypePlaceholder}
                options={disasterTypeOptions}
                keySelector={numericIdSelector}
                labelSelector={disasterTypeLabelSelector}
                value={value.disasterTypes}
                onChange={onChange}
                withSelectAll
            />
            <MultiSelectInput
                name="secondarySectors"
                label={strings.filterSectorLabel}
                placeholder={strings.filterSectorPlaceholder}
                options={secondarySectorOptions}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                disabled={disabled}
                value={value.secondarySectors}
                onChange={onChange}
                withSelectAll
            />
            <MultiSelectInput
                name="perComponents"
                label={strings.filterComponentLabel}
                placeholder={strings.filterComponentPlaceholder}
                options={perComponentOptions}
                keySelector={numericIdSelector}
                labelSelector={getFormattedComponentName}
                disabled={disabled}
                value={value.perComponents}
                onChange={onChange}
                withSelectAll
            />
            <MultiSelectInput
                name="organizationTypes"
                label={strings.organizationTypesLabel}
                placeholder={strings.organizationTypesLabelPlaceholder}
                options={organizationTypeOptions}
                keySelector={numericIdSelector}
                labelSelector={stringTitleSelector}
                disabled={disabled || organizationTypePending}
                value={value.organizationTypes}
                onChange={onChange}
                withSelectAll
            />
            <MultiSelectInput
                name="perLearningTypes"
                label={strings.perLearningTypesLabel}
                placeholder={strings.perLearningTypesLabelPlaceholder}
                options={perLearningTypeOptions}
                keySelector={perLearningTypeKeySelector}
                labelSelector={stringValueSelector}
                disabled={disabled}
                value={value.perLearningTypes}
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
