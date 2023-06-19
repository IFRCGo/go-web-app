import {
    useState,
    useMemo,
    useContext,
    useCallback,
} from 'react';
import { generatePath } from 'react-router-dom';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createListDisplayColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';

import type { FlashUpdate } from '../types';
import i18n from './i18n.json';
import styles from './styles.module.css';

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const keySelector = (item: FlashUpdate) => item.id;

type TableKey = number;
type CountryDistrict = FlashUpdate['country_district'][number];

function FlashUpdateTable() {
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const strings = useTranslation(i18n);
    const {
        country: countryRoute,
    } = useContext(RouteContext);

    const countryDistrictColumnParam = useCallback(
        (item: FlashUpdate) => ({
            list: item.country_district,
            keySelector: (countryDistrict: CountryDistrict) => countryDistrict.id,
            renderer: (countryDistrict: CountryDistrict) => (
                <Link
                    to={generatePath(
                        countryRoute.absolutePath,
                        { countryId: String(countryDistrict.country) },
                    )}
                >
                    {countryDistrict.country_details.name}
                </Link>
            ),
        }),
        [countryRoute],
    );

    const columns = useMemo(
        () => ([
            createDateColumn<FlashUpdate, TableKey>(
                'created_at',
                strings.flashUpdateTableLastUpdate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createStringColumn<FlashUpdate, TableKey>(
                'title',
                strings.flashUpdateTableReport,
                (item) => item.title,
                {
                    sortable: true,
                    columnClassName: styles.title,
                },
            ),
            createStringColumn<FlashUpdate, TableKey>(
                'hazard_type',
                strings.flashUpdateTableDisasterType,
                (item) => item.hazard_type_details.name,
            ),
            createListDisplayColumn<FlashUpdate, TableKey, FlashUpdate['country_district'][number]>(
                'country_district',
                strings.flashUpdateTableCountry,
                countryDistrictColumnParam,
            ),
        ]),
        [strings, countryDistrictColumnParam],
    );

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

    const [page, setPage] = useState(0);

    const PAGE_SIZE = 5;
    const {
        pending: flashUpdatePending,
        response: flashUpdateResponse,
    } = useRequest<ListResponse<FlashUpdate>>({
        url: 'api/v2/flash-update/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            created_at__gte: thirtyDaysAgo.toISOString(),
        },
    });

    const heading = resolveToComponent(
        strings.flashUpdateTableTitle,
        { numFlashUpdates: flashUpdateResponse?.count ?? '--' },
    );

    return (
        <Container
            className={styles.flashUpdatesTable}
            heading={heading}
            headerDescriptionClassName={styles.filters}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={flashUpdateResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="/"
                    withUnderline
                    withForwardIcon
                >
                    {strings.flashUpdateTableViewAllReports}
                </Link>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={flashUpdatePending}
                    className={styles.table}
                    columns={columns}
                    keySelector={keySelector}
                    data={flashUpdateResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default FlashUpdateTable;
