import {
    useState,
    useMemo,
    useContext,
    useCallback,
} from 'react';
import { generatePath } from 'react-router-dom';

import Page from '#components/Page';
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
import type { FlashUpdate, CountryDistrict } from '#types/flashUpdate';

import i18n from './i18n.json';
import styles from './styles.module.css';

const keySelector = (item: FlashUpdate) => item.id;

type TableKey = number;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

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
                strings.allFlashUpdatesLastUpdate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createStringColumn<FlashUpdate, TableKey>(
                'title',
                strings.allFlashUpdatesReport,
                (item) => item.title,
                {
                    sortable: true,
                    columnClassName: styles.title,
                },
            ),
            createStringColumn<FlashUpdate, TableKey>(
                'hazard_type',
                strings.allFlashUpdatesDisasterType,
                (item) => item.hazard_type_details.name,
            ),
            createListDisplayColumn<FlashUpdate, TableKey, FlashUpdate['country_district'][number]>(
                'country_district',
                strings.allFlashUpdatesCountry,
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

    const PAGE_SIZE = 15;
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
        },
    });

    const heading = resolveToComponent(
        strings.allFlashUpdatesTitle,
        { numFlashUpdates: flashUpdateResponse?.count ?? '--' },
    );

    return (
        <Page
            className={styles.allFlashUpdates}
            title={strings.allFlashUpdatesTitle}
            heading={heading}
        >
            <Container
                className={styles.flashUpdatesTable}
                headerDescriptionClassName={styles.filters}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={flashUpdateResponse?.count ?? 0}
                        maxItemsPerPage={PAGE_SIZE}
                        onActivePageChange={setPage}
                    />
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
        </Page>
    );
}

Component.displayName = 'AllFlashUpdates';
