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
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import {
    EAP_STATUS_APPROVED,
    EAP_STATUS_PENDING_PFA,
    EAP_STATUS_TECHNICALLY_VALIDATED,
    EAP_TYPE_FULL,
    EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import EapStatus, { type Props as EapStatusProps } from './EapStatus';
import EapTableActions, { type Props as EapTableActionProps } from './EapTableActions';
import Filters, { type FilterValue } from './Filters';
import {
    type EapExpandedItem,
    type EapExpandedListItem,
    type EapListItem,
} from './utils';

import i18n from './i18n.json';

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
        retrigger: reloadEapList,
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

    const aggregatedColumns = useMemo(
        () => ([
            createExpansionIndicatorColumn<EapListItem, number>(false),
            createDateColumn<EapListItem, number>(
                'created_at',
                strings.eapLastUpdated,
                (item) => item.modified_at,
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
            createElementColumn<EapListItem, number, EapStatusProps>(
                'status_display',
                strings.eapStatus,
                EapStatus,
                (key, row) => ({
                    eapId: key,
                    status: row.status,
                    onStatusUpdate: reloadEapList,
                }),
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
            reloadEapList,
        ],
    );

    const eapExpandedItems = useMemo(() => (
        listToMap(
            eapListResponse?.results,
            (eapListItem) => eapListItem.id,
            (eapListItem) => {
                const {
                    simplified_eap_details,
                    full_eap_details,
                    modified_at,
                    eap_type,
                    status,
                } = eapListItem;

                const eapStarted = simplified_eap_details.length > 0 || full_eap_details.length > 0;

                const items = [
                    {
                        label: 'EAP Development Registration',
                        lastUpdated: modified_at,
                        eap: eapListItem,
                        type: 'registration',
                        details: undefined,
                        disabled: false,
                    } satisfies EapExpandedListItem,
                    ...(eap_type === EAP_TYPE_SIMPLIFIED
                        ? simplified_eap_details.map((simplifiedEap) => ({
                            label: `EAP Application v${simplifiedEap.version}`,
                            lastUpdated: simplifiedEap.modified_at,
                            eap: eapListItem,
                            type: 'development',
                            details: {
                                eapType: EAP_TYPE_SIMPLIFIED,
                                data: simplifiedEap,
                            },
                            disabled: false,
                        } satisfies EapExpandedListItem)).toReversed()
                        : []
                    ),
                    ...(eap_type === EAP_TYPE_FULL
                        ? full_eap_details.map((fullEap) => ({
                            label: `EAP Application v${fullEap.version}`,
                            lastUpdated: fullEap.modified_at,
                            eap: eapListItem,
                            type: 'development',
                            details: {
                                eapType: EAP_TYPE_FULL,
                                data: fullEap,
                            },
                            disabled: false,
                        } satisfies EapExpandedListItem)).toReversed()
                        : []
                    ),
                    ((isNotDefined(eap_type) || !eapStarted)
                        ? ({
                            label: 'EAP Application v1',
                            eap: eapListItem,
                            type: 'development',
                            details: undefined,
                            disabled: true,
                        } satisfies EapExpandedListItem)
                        : undefined
                    ),
                    {
                        label: 'Technically Validated',
                        eap: eapListItem,
                        type: 'validated',
                        details: undefined,
                        disabled: status < EAP_STATUS_TECHNICALLY_VALIDATED,
                    } satisfies EapExpandedListItem,
                    {
                        label: 'Approved',
                        eap: eapListItem,
                        type: 'approved',
                        details: undefined,
                        disabled: status < EAP_STATUS_PENDING_PFA,
                    } satisfies EapExpandedListItem,
                    {
                        label: 'PFA Signed',
                        eap: eapListItem,
                        type: 'signed',
                        details: undefined,
                        disabled: status < EAP_STATUS_APPROVED,
                    } satisfies EapExpandedListItem,
                ].filter(isDefined).toReversed();

                return {
                    eap: eapListItem,
                    expandedItems: items,
                } satisfies EapExpandedItem;
            },
        )
    ), [eapListResponse]);

    const detailColumns = useMemo(
        () => ([
            createExpansionIndicatorColumn<EapExpandedListItem, string | number>(
                true,
                (row) => !!row.disabled,
            ),
            createDateColumn<EapExpandedListItem, string | number>(
                'created_at',
                strings.eapLastUpdated,
                (row) => row.lastUpdated,
            ),
            createStringColumn<EapExpandedListItem, string | number>(
                'title',
                '',
                (row) => row.label,
                { withLightText: (item) => !!item.disabled },
            ),
            createEmptyColumn<EapExpandedListItem, string | number>(),
            createElementColumn<EapExpandedListItem, string | number, EapTableActionProps>(
                'actions',
                '',
                EapTableActions,
                (_, row) => ({
                    expandedListItem: row,
                }),
            ),
            createEmptyColumn<EapExpandedListItem, string | number>(),
        ]),
        [strings.eapLastUpdated],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<EapListItem, number>) => {
            if (datum.id !== expandedRow?.id) {
                return row;
            }

            const subRows = eapExpandedItems?.[expandedRow.id];

            return (
                <>
                    {row}
                    <TableBodyContent
                        // FIXME: use better key
                        keySelector={(expandedItem) => expandedItem.label}
                        data={subRows?.expandedItems}
                        columns={detailColumns}
                        expandedContent
                    />
                </>
            );
        },
        [
            expandedRow,
            detailColumns,
            eapExpandedItems,
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
                columns={aggregatedColumns}
                rowModifier={rowModifier}
                keySelector={numericIdSelector}
                pending={eapListPending}
                filtered={filtered}
            />
        </Container>
    );
}
