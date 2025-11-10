import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createExpandColumn,
    createExpansionIndicatorColumn,
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import Filters, { type FilterValue } from './Filters';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EapResponse = GoApiResponse<'/api/v2/eap-registration/'>;
type EapListItem = NonNullable<EapResponse['results']>[number];

type Key = EapListItem['id'];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        filter,
        offset,
        limit,
        rawFilter,
        filtered,
        setFilterField,
    } = useFilterState<FilterValue>({
        filter: {},
        pageSize: 6,
    });

    const {
        response: eapResponse,
        pending: eapPending,
    } = useRequest({
        url: '/api/v2/eap-registration/',
        preserveResponse: true,
        query: {
            offset,
            limit,
            status: filter.status,
        },
    });

    const [expandedRow, setExpandedRow] = useState<EapListItem | undefined>();
    const handleExpandClick = useCallback(
        (row: EapListItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumns = useMemo(
        () => ([
            createDateColumn<EapListItem, number>(
                'created_at',
                'Last Updated',
                (item) => item.created_at,
                { columnClassName: styles.date },
            ),
            createStringColumn<EapListItem, number>(
                'name',
                'Name/Phase',
                (item) => {
                    const baseYear = new Date(item.created_at).getFullYear();
                    let addedYear = baseYear;
                    if (item.eap_type === 10) {
                        addedYear = baseYear + 4;
                    } else if (item.eap_type === 20) {
                        addedYear = baseYear + 2;
                    }
                    return `${item.country_details?.name}:
                        ${item.disaster_type_details?.name}
                        ${baseYear} - ${addedYear}`;
                },
                { columnClassName: styles.title },
            ),
            createStringColumn<EapListItem, number>(
                'eap_type_display',
                'EAP Type',
                (item) => item.eap_type_display,
                { columnClassName: styles.type },
            ),
            createStringColumn<EapListItem, number>(
                'status_display',
                'Status',
                (item) => item.status_display,
                { columnClassName: styles.status },
            ),
        ]),
        [],
    );

    const columns = useMemo(
        () => ([
            createExpansionIndicatorColumn<EapListItem, Key>(false),
            ...baseColumns,
            createExpandColumn<EapListItem, Key>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                }),
            ),
        ]),
        [baseColumns, handleExpandClick, expandedRow],
    );

    return (
        <Container
            childrenContainerClassName={styles.eapFormLinks}
            heading={strings.eapApplicationsHeading}
            withHeaderBorder
            filters={(
                <Filters
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            actions={(
                <>
                    <Link
                        to="home"
                        variant="secondary"
                    >
                        {strings.eapRegistrationLink}
                    </Link>
                    {/* TODO: Move this to table action
                    <Link
                        to="eapFullForm"
                        variant="secondary"
                    >
                        {strings.eapFormLink}
                    </Link>
                    <Link
                        to="simplifiedEapForm"
                        variant="secondary"
                    >
                        {strings.simplifiedEapLink}
                    </Link>
                    */}
                </>
            )}
        >
            {/* FIXME: Add eap registration link */}
            <Table
                className={styles.table}
                data={eapResponse?.results}
                columns={columns}
                keySelector={numericIdSelector}
                pending={eapPending}
                filtered={filtered}
            />
        </Container>
    );
}
