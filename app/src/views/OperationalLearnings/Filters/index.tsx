import { useCallback } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateInput,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined, isFalsyString } from '@togglecorp/fujs';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ExportButton from '#components/domain/ExportButton';
import RegionSelectInput, { RegionOption } from '#components/domain/RegionSelectInput';
import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes from '#hooks/domain/useDisasterType';
import useRegion from '#hooks/domain/useRegion';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Sector = NonNullable<GoApiResponse<'/api/v2/primarysector'>>[number];
type PerComponent = NonNullable<GoApiResponse<'/api/v2/per-formcomponent/'>['results']>[number];

const sectorKeySelector = (d: Sector) => d.key;
const sectorLabelSelector = (d: Sector) => d.label;
const perComponentKeySelector = (option: PerComponent) => option.id;
function perComponentLabelSelector(component: PerComponent) {
    if (isFalsyString(component.component_letter)) {
        return `${component.component_num}. ${component.title}`;
    }

    return `${component.component_num}(${component.component_letter}). ${component.title}`;
}

function Filters() {
    const strings = useTranslation(i18n);

    const {
        rawFilter,
        resetFilter,
        setFilter,
        setFilterField,
        filtered,
    } = useFilterState<{
        region?: RegionOption['key'],
        country?: number,
        disasterType?: number,
        startDateBefore?: string,
        sector?: number,
        component?: number,
        startDate?: string,
        search?: string | undefined;
    }>({
        filter: {},
    });

    const {
        response: primarySectorOptions,
        pending: primarySectorOptionsPending,
    } = useRequest({
        url: '/api/v2/primarysector',
        preserveResponse: true,
    });

    const {
        response: perFormComponentResponse,
        pending: perFormComponentResponsePending,
    } = useRequest({
        url: '/api/v2/per-formcomponent/',
        preserveResponse: true,
    });

    const handleExportClick = useCallback(() => setFilter({}), [setFilter]);
    const disasterTypes = useDisasterTypes();
    const disasterTypeName = (
        id: number | undefined,
    ): string | undefined => disasterTypes?.find((type) => type.id === id)?.name;

    const selectedFilters = [
        {
            value: rawFilter.region,
            label: useRegion({ id: rawFilter.region })?.region_name,
        },
        {
            value: rawFilter.country,
            label: useCountry({ id: rawFilter.country })?.name,
        },
        {
            value: rawFilter.disasterType,
            label: disasterTypeName(rawFilter.disasterType),
        },
        {
            value: rawFilter.sector,
            label: rawFilter.sector,
        },
        {
            value: rawFilter.component,
            label: rawFilter.component,
        },
    ].filter((filter) => isDefined(filter.value) && isDefined(filter.label));

    return (
        <Container
            contentViewType="vertical"
            withGridViewInFilter
            filters={(
                <>
                    <RegionSelectInput
                        placeholder={strings.filterRegionsPlaceholder}
                        name="region"
                        value={rawFilter.region}
                        onChange={setFilterField}
                    />
                    <CountrySelectInput
                        placeholder={strings.filterCountryPlaceholder}
                        name="country"
                        value={rawFilter.country}
                        onChange={setFilterField}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.filterDisasterTypePlaceholder}
                        name="disasterType"
                        value={rawFilter.disasterType}
                        onChange={setFilterField}
                    />
                    <SelectInput
                        placeholder={strings.filterBySectorPlaceholder}
                        name="sector"
                        keySelector={sectorKeySelector}
                        labelSelector={sectorLabelSelector}
                        options={primarySectorOptions}
                        optionsPending={primarySectorOptionsPending}
                        disabled={primarySectorOptionsPending}
                        value={rawFilter.sector}
                        onChange={setFilterField}
                    />
                    <SelectInput
                        placeholder={strings.filterByComponentPlaceholder}
                        name="component"
                        options={perFormComponentResponse?.results
                            ?.filter((formComponent) => !formComponent.is_parent)}
                        keySelector={perComponentKeySelector}
                        labelSelector={perComponentLabelSelector}
                        disabled={perFormComponentResponsePending}
                        value={rawFilter.component}
                        onChange={setFilterField}
                    />
                    <DateInput
                        name="startDateBefore"
                        onChange={setFilterField}
                        value={rawFilter.startDate}
                    />
                    <TextInput
                        name="search"
                        placeholder={strings.filterOpsLearningsSearchPlaceholder}
                        value={rawFilter.search}
                        onChange={setFilterField}
                        icons={<SearchLineIcon />}
                    />
                    <div className={styles.actions}>
                        <Button
                            name={undefined}
                            variant="secondary"
                            onClick={resetFilter}
                            disabled={!filtered}
                        >
                            {strings.opsLearningsFilterClear}
                        </Button>
                    </div>
                </>
            )}
            actions={(
                <ExportButton
                    onClick={handleExportClick}
                    progress={0}
                    pendingExport={false}
                    totalCount={0}
                />
            )}
        >
            {selectedFilters.length > 0 && (
                <div className={styles.selectedFilters}>
                    {strings.opsLearningsSelectedFilterView}
                    {selectedFilters.map((filter) => (
                        <div key={filter.value}>
                            {filter.label}
                        </div>
                    ))}
                </div>
            )}
        </Container>
    );
}

export default Filters;
