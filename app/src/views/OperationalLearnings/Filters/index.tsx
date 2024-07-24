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
import { isDefined } from '@togglecorp/fujs';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ExportButton from '#components/domain/ExportButton';
import PrimarySectorSelectInput from '#components/domain/PrimarySectorSelectInput';
import RegionSelectInput, { RegionOption } from '#components/domain/RegionSelectInput';
import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes from '#hooks/domain/useDisasterType';
import useRegion from '#hooks/domain/useRegion';
import useFilterState from '#hooks/useFilterState';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Option = {
    key: string;
    label: string;
};
const keySelector = (option: Option) => option.key;
const labelSelector = (option: Option) => option.label;
const options: Option[] = [];

function Filters() {
    const strings = useTranslation(i18n);

    const {
        rawFilter,
        resetFilter,
        setFilter,
        setFilterField,
        filtered,
    } = useFilterState<{
        region?:RegionOption['key'],
        country?:number,
        disasterType?:number,
        startDateBefore?: string,
        bySector?:number,
        byComponent?:string,
        startDate?:string,
        search?:string | undefined;
    }>({
        filter: {},
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
            value: rawFilter.bySector,
            label: rawFilter.bySector,
        },
        {
            value: rawFilter.byComponent,
            label: rawFilter.byComponent,
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
                    <PrimarySectorSelectInput
                        placeholder={strings.filterBySectorPlaceholder}
                        name="bySector"
                        options={options}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        value={rawFilter.bySector}
                        onChange={setFilterField}
                    />
                    <SelectInput
                        placeholder={strings.filterByComponentPlaceholder}
                        name="byComponent"
                        options={options}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        value={rawFilter.byComponent}
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
