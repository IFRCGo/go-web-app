import { useMemo } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Pager,
    SelectInput,
    Table,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    numericKeySelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { APPEAL_TYPE_DREF } from '#components/domain/ActiveOperationMap/utils';
import useFilterState from '#hooks/useFilterState';
import {
    createAppealCodeColumn,
    createBudgetColumn,
    createCountryColumn,
    createDisasterTypeColumn,
    createLinkColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];
type Key = AppealListItem['id'];

const PAGE_SIZE = 10;
const FIRST_YEAR = 2018;
const now = new Date();
const nowIso = now.toISOString();
const yearOptions = Array.from(
    { length: now.getFullYear() - FIRST_YEAR + 1 },
    (_, i) => ({
        key: now.getFullYear() - i,
        value: String(now.getFullYear() - i),
    }),
);
const appealKeySelector = (item: AppealListItem) => item.id;

interface Props {
    className?: string;
}

function DrefOperationsTable(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        limit,
        offset,
        rawFilter,
        filter,
        setFilterField,
        resetFilter,
        rawFiltered,
        filtered,
    } = useFilterState<{
        search?: string,
        year?: number,
    }>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const query = useMemo<AppealQueryParams>(
        () => ({
            limit,
            offset,
            ordering: '-start_date',
            atype: APPEAL_TYPE_DREF,
            // Default view lists ongoing operations only; picking a year
            // browses that year's operations including ended ones.
            end_date__gt: isDefined(filter.year) ? undefined : nowIso,
            search: filter.search,
            start_date__gte: isDefined(filter.year) ? `${filter.year}-01-01` : undefined,
            start_date__lt: isDefined(filter.year) ? `${filter.year + 1}-01-01` : undefined,
        }),
        [limit, offset, filter],
    );

    const {
        pending,
        response,
    } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const columns = useMemo(
        () => ([
            createDateColumn<AppealListItem, Key>(
                'start_date',
                strings.drefOpsStartDate,
                (item) => item.start_date,
            ),
            createAppealCodeColumn<AppealListItem, Key>(
                'code',
                strings.drefOpsCode,
                (item) => item.code,
            ),
            createLinkColumn<AppealListItem, Key>(
                'operation',
                strings.drefOpsOperation,
                (item) => item.name,
                // NOTE: about half of DREF appeals have no linked emergency;
                // without the guard the cell renders as a link that cannot resolve.
                (item) => (isDefined(item.event)
                    ? {
                        to: 'emergenciesLayout',
                        urlParams: { emergencyId: item.event },
                    }
                    : {
                        to: undefined,
                        withUnderline: false,
                    }),
            ),
            createDisasterTypeColumn<AppealListItem, Key>(
                'dtype',
                strings.drefOpsDisasterType,
                (item) => item.dtype?.name,
            ),
            createBudgetColumn<AppealListItem, Key>(
                'amount_requested',
                strings.drefOpsFunding,
                (item) => item.amount_requested,
            ),
            createCountryColumn<AppealListItem, Key>(
                'country',
                strings.drefOpsCountry,
                (item) => item.country?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country.id },
                }),
            ),
        ]),
        [
            strings.drefOpsStartDate,
            strings.drefOpsCode,
            strings.drefOpsOperation,
            strings.drefOpsDisasterType,
            strings.drefOpsFunding,
            strings.drefOpsCountry,
        ],
    );

    return (
        <Container
            className={className}
            heading={strings.drefOpsHeading}
            withHeaderBorder
            filters={(
                <>
                    <TextInput
                        name="search"
                        placeholder={strings.drefOpsFilterSearchPlaceholder}
                        value={rawFilter.search}
                        onChange={setFilterField}
                        icons={<SearchLineIcon />}
                    />
                    <SelectInput
                        placeholder={strings.drefOpsFilterAllYears}
                        name="year"
                        value={rawFilter.year}
                        onChange={setFilterField}
                        keySelector={numericKeySelector}
                        labelSelector={stringValueSelector}
                        options={yearOptions}
                    />
                    {rawFiltered && (
                        <Button
                            name={undefined}
                            onClick={resetFilter}
                        >
                            {strings.drefOpsClearFilters}
                        </Button>
                    )}
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={response?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                columns={columns}
                keySelector={appealKeySelector}
                data={response?.results}
                pending={pending}
                filtered={filtered}
            />
        </Container>
    );
}

export default DrefOperationsTable;
