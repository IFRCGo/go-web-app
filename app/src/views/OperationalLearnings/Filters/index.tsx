import { useCallback } from 'react';
import {
    Container,
    DateInput,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ExportButton from '#components/domain/ExportButton';
import KeywordSearchSelectInput from '#components/domain/KeywordSearchSelectInput';
import RegionSelectInput, { RegionOption } from '#components/domain/RegionSelectInput';
import useFilterState from '#hooks/useFilterState';

import i18n from './i18n.json';

type Option = {
    key: string;
    label: string;
};

function Filters() {
    const strings = useTranslation(i18n);
    const options: Option[] = [];
    const keySelector = (option: Option) => option.key;
    const labelSelector = (option: Option) => option.label;
    const {
        rawFilter,
        setFilter,
        setFilterField,
    } = useFilterState<{
        region: RegionOption['key'],
        country: number,
        disasterType:number,
        startDateBefore?: string,
        bySector?:number,
        byComponent?:number,
        startDate?:string
    }>({
        filter: {
            region: 0,
            country: 0,
            disasterType: 0,
        },
    });
    const handleExportClick = useCallback(() => setFilter({}), [setFilter]);

    return (
        <Container
            contentViewType="vertical"
            withGridViewInFilter
            filters={(
                <>
                    <RegionSelectInput
                        placeholder={strings.filterRegionsPlaceholder}
                        name="region"
                        onChange={setFilterField}
                        value={rawFilter.region}
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
                        name="startDateFrom"
                        onChange={setFilterField}
                        value={rawFilter.startDate}
                    />
                    <KeywordSearchSelectInput />
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
        />
    );
}
export default Filters;
