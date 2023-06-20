import {
    useState,
    useMemo,
    useContext,
    useCallback,
} from 'react';
import { generatePath } from 'react-router-dom';

import Page from '#components/Page';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createNumberColumn,
    createLinkColumn,
    createListDisplayColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import { sumSafe } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Country {
    average_household_size: number | null;
    fdrs: string;
    id: number;
    independent: boolean;
    is_deprecated: boolean;
    iso: string | null;
    iso3: string | null;
    name: string;
    record_type: number;
    record_type_display: string;
    region: number | null;
    society_name: string;
}

interface Appeal {
    aid: string;
    amount_funded: string;
    amount_requested: string;
    code: string;
    ind: number;
    num_beneficiaries: number;
    start_date: string;
    status: number;
    status_display: string;
}

export interface EventItem {
    active_deployments: number;
    appeals: Appeal[];
    auto_generated: boolean;
    countries: Country[];
    created_at: string;
    disaster_start_date: string;
    dtype: {
        id: number;
        name: string;
        summary: string;
    }
    emergency_response_contact_email: string | null;
    field_reports: {
        num_affected: number | null;
        updated_at: string,
    }[];
    glide: string;
    id: number;
    ifrc_severity_label: number;
    ifrc_severity_label_display: string;
    is_featured: boolean;
    is_featured_region: boolean;
    name: string;
    num_affected: number | null;
    parent_event: number | null;
    slug: string | null;
    summary: string;
    tab_one_title: string;
    tab_three_title: string | null;
    tab_two_title: string | null;
    updated_at: string;
}

const keySelector = (item: EventItem) => item.id;

type TableKey = number;
type CountryItem = EventItem['countries'][number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const countryListColumnParams = useCallback(
        (item: EventItem) => ({
            list: item.countries,
            keySelector: (country: CountryItem) => country.id,
            renderer: (country: CountryItem) => (
                <Link
                    to={generatePath(
                        countryRoute.absolutePath,
                        { countryId: String(country.id) },
                    )}
                >
                    {country.name}
                </Link>
            ),
        }),
        [countryRoute],
    );

    const columns = useMemo(
        () => ([
            createDateColumn<EventItem, TableKey>(
                'created_at',
                strings.allEmergenciesDate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<EventItem, TableKey>(
                'event_name',
                strings.allEmergenciesName,
                (item) => item.name,
                (item) => ({
                    to: generatePath(emergencyRoute.absolutePath, { emergencyId: item.id }),
                }),
            ),
            createStringColumn<EventItem, TableKey>(
                'dtype',
                strings.allEmergenciesDisasterType,
                (item) => item.dtype.name,
            ),
            createStringColumn<EventItem, TableKey>(
                'dtype',
                strings.allEmergenciesGlide,
                // FIXME: empty string from server
                (item) => item.glide || '-',
            ),
            createNumberColumn<EventItem, TableKey>(
                'amount_requested',
                strings.allEmergenciesRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => Number(appeal.amount_requested)),
                ),
            ),
            createListDisplayColumn<EventItem, TableKey, CountryItem>(
                'countries',
                strings.allEmergenciesCountry,
                countryListColumnParams,
            ),
        ]),
        [strings, emergencyRoute, countryListColumnParams],
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
        pending: eventPending,
        response: eventResponse,
    } = useRequest<ListResponse<EventItem>>({
        url: 'api/v2/event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
        },
    });

    const heading = resolveToComponent(
        strings.allEmergenciesHeading,
        { numEmergencies: eventResponse?.count ?? '--' },
    );

    return (
        <Page
            className={styles.allEmergencies}
            title={strings.allEmergenciesTitle}
            heading={heading}
        >
            <Container
                className={styles.emergenciesTable}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={eventResponse?.count ?? 0}
                        maxItemsPerPage={PAGE_SIZE}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        pending={eventPending}
                        className={styles.table}
                        columns={columns}
                        keySelector={keySelector}
                        data={eventResponse?.results}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllEmergencies';
