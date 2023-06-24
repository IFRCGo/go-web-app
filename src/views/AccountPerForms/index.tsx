import {
    useMemo,
    useContext,
    useCallback,
    useState,
} from 'react';
import { generatePath } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import Table from '#components/Table';
import {
    createActionColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
    createStringColumn,
    createExpandColumn,
    createEmptyColumn,
} from '#components/Table/ColumnShortcuts';
import TableBodyContent from '#components/Table/TableBodyContent';
import type { RowOptions } from '#components/Table/types';
import Link from '#components/Link';
import Container from '#components/Container';
import RouteContext from '#contexts/route';
import type { GET } from '#types/serverResponse';

import styles from './styles.module.css';

type PerProcessStatusResponse = GET['api/v2/aggregated-per-process-status'];
type PerProcessStatusItem = PerProcessStatusResponse['results'][number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [expandedRow, setExpandedRow] = useState<PerProcessStatusItem | undefined>();
    const {
        pending: aggregatedStatusPending,
        response: aggregatedStatusResponse,
    } = useRequest<PerProcessStatusResponse>({
        url: 'api/v2/aggregated-per-process-status',
    });

    const {
        // pending: countryStatusPending,
        response: countryStatusResponse,
    } = useRequest<PerProcessStatusResponse>({
        skip: isNotDefined(expandedRow),
        url: 'api/v2/per-process-status',
        query: {
            country: expandedRow?.country,
        },
    });

    const {
        country: countryRoute,
        perOverviewForm: perOverviewFormRoute,
        newPerOverviewForm: newPerOverviewFormRoute,
    } = useContext(RouteContext);

    const handleExpandClick = useCallback(
        (row: PerProcessStatusItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumn = useMemo(
        () => ([
            createLinkColumn<PerProcessStatusItem, number | string>(
                'country',
                'Country',
                (item) => item.country_details?.name,
                (item) => ({
                    to: generatePath(
                        countryRoute.absolutePath,
                        { countryId: String(item.country) },
                    ),
                }),
            ),
            createDateColumn<PerProcessStatusItem, number | string>(
                'date_of_assessment',
                'Start date',
                (item) => item.date_of_assessment,
            ),
            createNumberColumn<PerProcessStatusItem, number | string>(
                'assessment_number',
                'PER cycle',
                (item) => item.assessment_number,
            ),
            createStringColumn<PerProcessStatusItem, number | string>(
                'phase',
                'Phase',
                (item) => (item.phase ? `${item.phase} - ${item.phase_display}` : undefined),
            ),
            createActionColumn<PerProcessStatusItem, number | string>(
                'actions',
                (item) => ({
                    children: (
                        <Link
                            to={generatePath(
                                perOverviewFormRoute.absolutePath,
                                { perId: item.id },
                            )}
                        >
                            Edit
                        </Link>
                    ),
                }),
            ),
        ]),
        [countryRoute, perOverviewFormRoute],
    );

    const aggregatedColumns = useMemo(
        () => ([
            ...baseColumn,
            createExpandColumn<PerProcessStatusItem, number>(
                'expandRow',
                '',
                handleExpandClick,
                expandedRow?.id,
            ),
        ]),
        [handleExpandClick, baseColumn, expandedRow?.id],
    );

    const detailColumns = useMemo(
        () => ([
            ...baseColumn,
            createEmptyColumn(),
        ]),
        [baseColumn],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<PerProcessStatusItem, number>) => {
            if (datum.country !== expandedRow?.country) {
                return row;
            }

            return (
                <>
                    {row}
                    <TableBodyContent
                        keySelector={(item) => item.id}
                        data={countryStatusResponse?.results}
                        columns={detailColumns}
                        cellClassName={styles.subCell}
                    />
                </>
            );
        },
        [expandedRow, detailColumns, countryStatusResponse],
    );

    return (
        <Container
            className={styles.accountPerForms}
            heading="PER Process Status"
            headingLevel={2}
            withHeaderBorder
            actions={(
                <Link to={newPerOverviewFormRoute.absolutePath}>
                    Start New PER Process
                </Link>
            )}
        >
            <Table
                pending={aggregatedStatusPending}
                columns={aggregatedColumns}
                keySelector={(item) => item.id}
                data={aggregatedStatusResponse?.results}
                rowModifier={rowModifier}
            />
        </Container>
    );
}

Component.displayName = 'AccountPerForms';
