import {
    useState,
    useMemo,
} from 'react';

import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
import Table from '#components/Table';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createCountryListColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import NumberOutput from '#components/NumberOutput';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FlashUpdateResponse = GoApiResponse<'/api/v2/flash-update/'>;
type FlashUpdateListItem = NonNullable<FlashUpdateResponse['results']>[number];

const keySelector = (item: FlashUpdateListItem) => item.id;

type TableKey = number;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const columns = useMemo(
        () => ([
            createDateColumn<FlashUpdateListItem, TableKey>(
                'created_at',
                strings.allFlashUpdatesLastUpdate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createStringColumn<FlashUpdateListItem, TableKey>(
                'title',
                strings.allFlashUpdatesReport,
                (item) => item.title,
                {
                    sortable: true,
                    columnClassName: styles.title,
                },
            ),
            createStringColumn<FlashUpdateListItem, TableKey>(
                'hazard_type',
                strings.allFlashUpdatesDisasterType,
                (item) => item.hazard_type_details.name,
            ),
            createCountryListColumn<FlashUpdateListItem, TableKey>(
                'country_district',
                strings.allFlashUpdatesCountry,
                (item) => item.country_district?.map(
                    (country_district) => country_district.country_details,
                ) ?? [],
            ),
        ]),
        [strings],
    );

    const [page, setPage] = useState(1);

    const PAGE_SIZE = 15;
    const {
        pending: flashUpdatePending,
        response: flashUpdateResponse,
    } = useRequest({
        url: '/api/v2/flash-update/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
        },
    });

    const heading = useMemo(
        () => resolveToComponent(
            strings.allFlashUpdatesTitle,
            {
                numFlashUpdates: (
                    <NumberOutput
                        value={flashUpdateResponse?.count}
                    />
                ),
            },
        ),
        [strings, flashUpdateResponse],
    );

    return (
        <Page
            className={styles.allFlashUpdates}
            title={strings.allFlashUpdatesTitle}
            heading={heading}
        >
            <Container
                className={styles.flashUpdatesTable}
                headerDescriptionContainerClassName={styles.filters}
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
                        filtered={false}
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
