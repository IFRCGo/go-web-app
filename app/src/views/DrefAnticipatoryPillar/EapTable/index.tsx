import { useMemo } from 'react';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useAuth from '#hooks/domain/useAuth';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import { EAP_TYPE_FULL } from '#utils/constants';
import {
    createBudgetColumn,
    createLinkColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type EapResponse = GoApiResponse<'/api/v2/eap-registration/'>;
type EapQueryParams = GoApiUrlQuery<'/api/v2/eap-registration/'>;
type EapListItem = NonNullable<EapResponse['results']>[number];
type Key = EapListItem['id'];

const PAGE_SIZE = 10;

interface Props {
    className?: string;
}

function EapTable(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);
    const { eap_eap_status: eapStatusOptions } = useGlobalEnums();
    // Public page, private endpoint: without the skip this reads as an empty
    // table rather than a login prompt.
    const { isAuthenticated } = useAuth();

    const {
        page,
        setPage,
        limit,
        offset,
        filtered,
    } = useFilterState<{ status?: number }>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const query = useMemo<EapQueryParams>(
        () => ({
            limit,
            offset,
        }),
        [limit, offset],
    );

    const {
        pending,
        response,
    } = useRequest({
        skip: !isAuthenticated,
        url: '/api/v2/eap-registration/',
        preserveResponse: true,
        query,
    });

    const eapStatusMap = useMemo(
        () => listToMap(
            eapStatusOptions ?? [],
            (status) => status.key,
            (status) => status.value,
        ),
        [eapStatusOptions],
    );

    const columns = useMemo(
        () => ([
            createDateColumn<EapListItem, Key>(
                'approved_at',
                strings.eapTableDate,
                (item) => item.approved_at,
            ),
            // EAP name links to the generated EAP Summary PDF.
            // TODO: open in a new window once the export route supports it.
            createLinkColumn<EapListItem, Key>(
                'name',
                strings.eapTableName,
                (item) => [item.country_details?.name, item.disaster_type_details?.name]
                    .filter(isDefined)
                    .join(' – '),
                (item) => ({
                    to: 'eapSummaryExport',
                    urlParams: { eapId: item.id },
                }),
            ),
            createStringColumn<EapListItem, Key>(
                'status',
                strings.eapTableStatus,
                (item) => (isDefined(item.status) ? eapStatusMap?.[item.status] : undefined),
            ),
            createStringColumn<EapListItem, Key>(
                'country',
                strings.eapTableCountry,
                (item) => item.country_details?.name,
            ),
            createStringColumn<EapListItem, Key>(
                'disaster_type',
                strings.eapTableDisasterType,
                (item) => item.disaster_type_details?.name,
            ),
            createBudgetColumn<EapListItem, Key>(
                'total_budget',
                strings.eapTableRequirements,
                (item) => {
                    const fullBudget = item.full_eap_details?.find(
                        (detail) => detail.id === item.latest_full_eap,
                    )?.total_budget;
                    const simplifiedBudget = item.simplified_eap_details?.find(
                        (detail) => detail.id === item.latest_simplified_eap,
                    )?.total_budget;

                    if (isNotDefined(item.eap_type)) {
                        return fullBudget ?? simplifiedBudget;
                    }

                    return item.eap_type === EAP_TYPE_FULL
                        ? fullBudget
                        : simplifiedBudget;
                },
            ),
        ]),
        [
            eapStatusMap,
            strings.eapTableDate,
            strings.eapTableName,
            strings.eapTableStatus,
            strings.eapTableCountry,
            strings.eapTableDisasterType,
            strings.eapTableRequirements,
        ],
    );

    return (
        <Container
            className={className}
            heading={strings.eapTableHeading}
            withHeaderBorder
            empty={!isAuthenticated}
            emptyMessage={strings.eapTableLoginRequired}
            footerActions={isAuthenticated ? (
                <Pager
                    activePage={page}
                    itemsCount={response?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            ) : undefined}
        >
            <Table
                columns={columns}
                keySelector={numericIdSelector}
                data={response?.results}
                pending={pending}
                filtered={filtered}
            />
        </Container>
    );
}

export default EapTable;
