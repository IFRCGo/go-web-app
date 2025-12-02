import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    Pager,
    type RowOptions,
    Table,
    TableBodyContent,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createElementColumn,
    createEmptyColumn,
    createExpandColumn,
    createExpansionIndicatorColumn,
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import {
    EAP_TYPE_FULL,
    EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import EapTableActions, { type Props as EapTableActionProps } from './EapTableActions';
import Filters, { type FilterValue } from './Filters';

import i18n from './i18n.json';

type EapResponse = GoApiResponse<'/api/v2/eap-registration/'>;
type EapListItem = NonNullable<EapResponse['results']>[number];

type Key = EapListItem['id'];
const ITEM_PER_PAGE = 6;

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
        page,
        setPage,
    } = useFilterState<FilterValue>({
        filter: {},
        pageSize: ITEM_PER_PAGE,
    });

    const {
        response: eapListResponse,
        pending: eapListPending,
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
                strings.eapLastUpdated,
                (item) => item.created_at,
            ),
            createStringColumn<EapListItem, number>(
                'name',
                strings.eapName,
                (item) => {
                    const baseYear = new Date(item.created_at).getFullYear();
                    let addedYear = baseYear;
                    if (item.eap_type === EAP_TYPE_FULL) {
                        addedYear = baseYear + 5;
                    } else if (item.eap_type === EAP_TYPE_SIMPLIFIED) {
                        addedYear = baseYear + 2;
                    }
                    return `${item.country_details?.name}:
                        ${item.disaster_type_details?.name}
                        ${baseYear} - ${addedYear}`;
                },
            ),
            createStringColumn<EapListItem, number>(
                'eap_type_display',
                strings.eapType,
                (item) => item.eap_type_display,
            ),
            createStringColumn<EapListItem, number>(
                'status_display',
                strings.eapStatus,
                (item) => item.status_display,
            ),
            createExpandColumn<EapListItem, Key>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                }),
            ),
        ]),
        [
            strings.eapLastUpdated,
            strings.eapName,
            strings.eapType,
            strings.eapStatus,
            expandedRow,
            handleExpandClick,
        ],
    );

    const detailColumns = useMemo(
        () => ([
            createExpansionIndicatorColumn<EapListItem, number>(true),
            createStringColumn<EapListItem, number>(
                'title',
                '',
                () => strings.eapRegistration,
            ),
            createEmptyColumn(),
            createElementColumn<EapListItem, number, EapTableActionProps>(
                'actions',
                '',
                EapTableActions,
                (eapId, eap) => ({
                    eapId,
                    eapType: eap.eap_type,
                }),
            ),
            createEmptyColumn(),
        ]),
        [strings.eapRegistration],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<EapListItem, number>) => {
            if (datum.id !== expandedRow?.id) {
                return row;
            }

            const subRows = eapListResponse?.results?.filter(
                (subRow) => subRow.id === datum.id,
            );

            return (
                <>
                    {row}
                    <TableBodyContent
                        keySelector={numericIdSelector}
                        data={subRows}
                        columns={detailColumns}
                    />
                </>
            );
        },
        [
            expandedRow,
            detailColumns,
            eapListResponse,
        ],
    );

    return (
        <Container
            heading={strings.eapApplicationsHeading}
            withHeaderBorder
            filters={(
                <Filters
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            headerActions={(
                <Link
                    to="newEapDevelopmentRegistration"
                    styleVariant="outline"
                    colorVariant="primary"
                >
                    {strings.eapRegistrationLink}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eapListResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                data={eapListResponse?.results}
                columns={baseColumns}
                rowModifier={rowModifier}
                keySelector={numericIdSelector}
                pending={eapListPending}
                filtered={filtered}
            />
        </Container>
    );
}
