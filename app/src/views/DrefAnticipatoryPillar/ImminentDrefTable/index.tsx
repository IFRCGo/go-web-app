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
    numericIdSelector,
    numericKeySelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import useAuth from '#hooks/domain/useAuth';
import useDisasterTypes from '#hooks/domain/useDisasterType';
import useFilterState from '#hooks/useFilterState';
import { DREF_TYPE_IMMINENT } from '#utils/constants';
import {
    createAppealCodeColumn,
    createCountryColumn,
    createDisasterTypeColumn,
    createTitleColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type ActiveDrefQueryParams = GoApiUrlQuery<'/api/v2/active-dref/'>;
type ActiveDrefResponse = GoApiResponse<'/api/v2/active-dref/'>;
type ActiveDrefItem = NonNullable<ActiveDrefResponse['results']>[number];
type Key = ActiveDrefItem['id'];

const PAGE_SIZE = 10;
const FIRST_YEAR = 2018;
const now = new Date();
const yearOptions = Array.from(
    { length: now.getFullYear() - FIRST_YEAR + 1 },
    (_, i) => ({
        key: now.getFullYear() - i,
        value: String(now.getFullYear() - i),
    }),
);

function ImminentDrefTable() {
    const strings = useTranslation(i18n);
    const disasterTypes = useDisasterTypes();
    // Public page, private endpoint: without the skip this reads as an empty
    // table rather than a login prompt.
    const { isAuthenticated } = useAuth();

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

    const query = useMemo<ActiveDrefQueryParams>(
        () => ({
            limit,
            offset,
            type_of_dref: [DREF_TYPE_IMMINENT],
            search: filter.search,
            // The backend filters accept dates only (%Y-%m-%d); Jan 1 of the
            // next year as the upper bound keeps Dec 31 records included.
            created_at__gte: isDefined(filter.year)
                ? `${filter.year}-01-01`
                : undefined,
            created_at__lte: isDefined(filter.year)
                ? `${filter.year + 1}-01-01`
                : undefined,
        }),
        [limit, offset, filter],
    );

    const {
        pending,
        response,
    } = useRequest({
        skip: !isAuthenticated,
        url: '/api/v2/active-dref/',
        preserveResponse: true,
        query,
    });

    const disasterTypeMap = useMemo(
        () => listToMap(
            disasterTypes ?? [],
            (disasterType) => disasterType.id,
            (disasterType) => disasterType.name,
        ),
        [disasterTypes],
    );

    const columns = useMemo(
        () => ([
            createDateColumn<ActiveDrefItem, Key>(
                'created_at',
                strings.imminentStartDate,
                (item) => item.created_at,
            ),
            createAppealCodeColumn<ActiveDrefItem, Key>(
                'appeal_code',
                strings.imminentCode,
                (item) => item.appeal_code,
            ),
            // NOTE: /api/v2/active-dref/ does not expose the linked emergency, so
            // the title cannot be a link yet (see MiniDrefSerializer in go-api).
            createTitleColumn<ActiveDrefItem, Key>(
                'operation',
                strings.imminentOperation,
                (item) => item.title,
            ),
            createDisasterTypeColumn<ActiveDrefItem, Key>(
                'disaster_type',
                strings.imminentDisasterType,
                (item) => (isDefined(item.disaster_type)
                    ? disasterTypeMap?.[item.disaster_type]
                    : undefined),
            ),
            createCountryColumn<ActiveDrefItem, Key>(
                'country',
                strings.imminentCountry,
                (item) => item.country_details?.name,
                (item) => (isDefined(item.country)
                    ? {
                        to: 'countriesLayout',
                        urlParams: { countryId: item.country },
                    }
                    : {
                        to: undefined,
                        withUnderline: false,
                    }),
            ),
        ]),
        [
            disasterTypeMap,
            strings.imminentStartDate,
            strings.imminentCode,
            strings.imminentOperation,
            strings.imminentDisasterType,
            strings.imminentCountry,
        ],
    );

    return (
        <Container
            heading={strings.imminentTableHeading}
            withHeaderBorder
            empty={!isAuthenticated}
            emptyMessage={strings.imminentLoginRequired}
            filters={isAuthenticated ? (
                <>
                    <TextInput
                        name="search"
                        placeholder={strings.imminentFilterSearchPlaceholder}
                        value={rawFilter.search}
                        onChange={setFilterField}
                        icons={<SearchLineIcon />}
                    />
                    <SelectInput
                        placeholder={strings.imminentFilterAllYears}
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
                            {strings.imminentClearFilters}
                        </Button>
                    )}
                </>
            ) : undefined}
            footerActions={isAuthenticated ? (
                <Pager
                    activePage={page}
                    itemsCount={response?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            ) : undefined}
        >
            <Table
                columns={columns}
                keySelector={numericIdSelector}
                data={response?.results}
                pending={pending}
                filtered={filtered}
            />
        </Container>
    );
}

export default ImminentDrefTable;
