import {
    useMemo,
} from 'react';

import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createCountryListColumn,
    createElementColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import NumberOutput from '#components/NumberOutput';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { resolveToComponent } from '#utils/translation';

import FlashUpdatesTableAction, {
    Props as FlashUpdatesTableActions,
} from './FlashUpdatesTableActions';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FlashUpdateResponse = GoApiResponse<'/api/v2/flash-update/'>;
type FlashUpdateListItem = NonNullable<FlashUpdateResponse['results']>[number];
type TableKey = number;

const keySelector = (item: FlashUpdateListItem) => item.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 15,
    });

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
            createLinkColumn<FlashUpdateListItem, TableKey>(
                'title',
                strings.allFlashUpdatesReport,
                (item) => item.title,
                (item) => ({
                    to: 'flashUpdateFormDetails',
                    urlParams: { flashUpdateId: item.id },
                }),
                {
                    sortable: true,
                    columnClassName: styles.title,
                },
            ),
            createStringColumn<FlashUpdateListItem, TableKey>(
                'hazard_type',
                strings.allFlashUpdatesDisasterType,
                (item) => item.hazard_type_details.name,
                { sortable: true },
            ),
            createCountryListColumn<FlashUpdateListItem, TableKey>(
                'country_district',
                strings.allFlashUpdatesCountry,
                (item) => item.country_district?.map(
                    (country_district) => country_district.country_details,
                ),
            ),
            createElementColumn<
                FlashUpdateListItem,
                number,
                FlashUpdatesTableActions
            >(
                'actions',
                '',
                FlashUpdatesTableAction,
                (flashUpdateId) => ({
                    type: 'activity',
                    flashUpdateId,
                }),
            ),
        ]),
        [
            strings.allFlashUpdatesLastUpdate,
            strings.allFlashUpdatesReport,
            strings.allFlashUpdatesDisasterType,
            strings.allFlashUpdatesCountry,
        ],
    );

    const {
        pending: flashUpdatePending,
        response: flashUpdateResponse,
    } = useRequest({
        url: '/api/v2/flash-update/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering,
        },
    });

    const heading = useMemo(
        () => resolveToComponent(
            strings.allFlashUpdatesHeading,
            {
                numFlashUpdates: (
                    <NumberOutput
                        value={flashUpdateResponse?.count}
                    />
                ),
            },
        ),
        [strings.allFlashUpdatesHeading, flashUpdateResponse],
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
                        maxItemsPerPage={limit}
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
