import { useState, useMemo, useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
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
import SelectInput from '#components/SelectInput';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
    createListDisplayColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useUrlSearchState from '#hooks/useUrlSearchState';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import type { FieldReport } from '#types/fieldReport';

import i18n from './i18n.json';
import styles from './styles.module.css';

const keySelector = (item: FieldReport) => item.id;

type TableKey = number;
interface AppealType {
    value: string;
    label: string;
}

// FIXME: translate this
const appealTypeOptions: AppealType[] = [
    { value: '0', label: 'DREF' },
    { value: '1', label: 'Emergency Appeals' },
    { value: '2', label: 'Movement' },
    { value: '3', label: 'Early Action Protocol (EAP) Activation' },
];

const appealTypeKeySelector = (item: AppealType) => item.value;
const appealTypeLabelSelector = (item: AppealType) => item.label;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;
    const [appealType, setAppealType] = useUrlSearchState('atype');

    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createDateColumn<FieldReport, TableKey>(
                'created_at',
                strings.allFieldReportsCreatedAt,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createStringColumn<FieldReport, TableKey>(
                'summary',
                strings.allFieldReportsName,
                (item) => item.summary,
                {
                    sortable: true,
                    columnClassName: styles.summary,
                },
            ),
            createLinkColumn<FieldReport, TableKey>(
                'event_name',
                strings.allFieldReportsEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event.id })
                        : undefined,
                }),
            ),
            createStringColumn<FieldReport, TableKey>(
                'dtype',
                strings.allFieldReportsDisasterType,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createListDisplayColumn<FieldReport, TableKey, FieldReport['countries'][number]>(
                'countries',
                strings.allFieldReportsCountry,
                (item) => ({
                    list: item.countries,
                    keySelector: (country) => country.id,
                    renderer: (country) => (
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
            ),
        ]),
        [strings, countryRoute, emergencyRoute],
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
        pending: fieldReportPending,
        response: fieldReportResponse,
    } = useRequest<ListResponse<FieldReport>>({
        url: 'api/v2/field_report/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
        },
    });

    const heading = resolveToComponent(
        strings.allFieldReportsHeading,
        { numFieldReports: fieldReportResponse?.count ?? '--' },
    );

    return (
        <Page
            className={styles.allFieldReports}
            title={strings.allFieldReportsTitle}
            heading={heading}
            info={(
                <SelectInput
                    label="Type of Appeal"
                    name={undefined}
                    value={appealType}
                    onChange={setAppealType}
                    keySelector={appealTypeKeySelector}
                    labelSelector={appealTypeLabelSelector}
                    options={appealTypeOptions}
                />
            )}
        >
            <Container
                className={styles.fieldReportsTable}
                headerDescriptionClassName={styles.filters}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={fieldReportResponse?.count ?? 0}
                        maxItemsPerPage={PAGE_SIZE}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        pending={fieldReportPending}
                        className={styles.table}
                        columns={columns}
                        keySelector={keySelector}
                        data={fieldReportResponse?.results}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllFieldReports';
