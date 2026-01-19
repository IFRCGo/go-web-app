import {
    useEffect,
    useMemo,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createElementColumn,
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import usePermissions from '#hooks/domain/usePermissions';
import useFilterState from '#hooks/useFilterState';
import { getFirstTruthyString } from '#utils/common';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import type { FilterValue } from '../Filters';
import LocalUnitStatus, { type LocalUnitStatusProps } from '../LocalUnitStatus';
import LocalUnitsTableActions, { type Props as LocalUnitsTableActionsProps } from './LocalUnitTableActions';

import i18n from './i18n.json';
import styles from './styles.module.css';

const PAGE_SIZE = 10;

type LocalUnitsTableResponse = GoApiResponse<'/api/v2/local-units/'>;
type LocalUnitsTableListItem = NonNullable<LocalUnitsTableResponse['results']>[number];

interface Props {
    filter: FilterValue;
    filtered: boolean;
}

function LocalUnitsTable(props: Props) {
    const {
        filter,
        filtered,
    } = props;

    const strings = useTranslation(i18n);
    const {
        isSuperUser,
        isCountryAdmin,
        isRegionAdmin,
        isLocalUnitGlobalValidator,
        isLocalUnitRegionValidator,
        isLocalUnitCountryValidator,
    } = usePermissions();

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const countryId = countryResponse?.id;

    const hasPermission = isSuperUser
        || isLocalUnitGlobalValidator()
        || isLocalUnitCountryValidator(countryResponse?.id)
        || isLocalUnitRegionValidator(countryResponse?.region ?? undefined);

    const hasAddEditLocalUnitPermission = isCountryAdmin(countryResponse?.id)
        || isRegionAdmin(countryResponse?.region)
        || hasPermission;

    const {
        limit,
        offset,
        page,
        setPage,
        setFilter,
    } = useFilterState<FilterValue>({
        filter,
        pageSize: PAGE_SIZE,
    });

    useEffect(() => {
        setFilter(filter);
    }, [filter, setFilter]);

    const {
        response: externallyManagedLocalUnitsResponse,
        pending: externallyManagedLocalUnitsPending,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/externally-managed-local-unit/',
        query: {
            country__id: countryId,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const {
        pending: localUnitsPending,
        error: localUnitsError,
        response: localUnitsResponse,
        retrigger: refetchLocalUnits,
    } = useRequest({
        skip: isNotDefined(countryResponse?.iso3),
        url: '/api/v2/local-units/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            type__code: filter?.type,
            status: filter?.status,
            search: filter?.search,
            country__iso3: isDefined(countryResponse?.iso3) ? countryResponse?.iso3 : undefined,
        },
    });

    const externallyManagedUnitByType = useMemo(() => {
        listToMap(
            externallyManagedLocalUnitsResponse?.results,
            ({ local_unit_type_details }) => local_unit_type_details.id,
            ({ enabled }) => enabled,
        );
    }, [externallyManagedLocalUnitsResponse?.results]);

    const columns = useMemo(() => {
        if (hasAddEditLocalUnitPermission) {
            return [
                createStringColumn<LocalUnitsTableListItem, number>(
                    'branch_name',
                    strings.localUnitsTableName,
                    (item) => getFirstTruthyString(
                        item.local_branch_name,
                        item.english_branch_name,
                    ),
                ),
                createStringColumn<LocalUnitsTableListItem, number>(
                    'address',
                    strings.localUnitsTableAddress,
                    (item) => getFirstTruthyString(
                        item.address_loc,
                        item.address_en,
                    ),
                ),
                createStringColumn<LocalUnitsTableListItem, number>(
                    'type',
                    strings.localUnitsTableType,
                    (item) => item.type_details.name,
                    { columnClassName: styles.type },
                ),
                createElementColumn<LocalUnitsTableListItem, number, LocalUnitStatusProps>(
                    'status',
                    strings.localUnitsTableStatus,
                    LocalUnitStatus,
                    (_, item) => ({
                        value: item.status,
                        valueDisplay: item.status_details,
                        compact: true,
                    }),
                ),
                createElementColumn<LocalUnitsTableListItem, number, LocalUnitsTableActionsProps>(
                    'actions',
                    '',
                    LocalUnitsTableActions,
                    // FIXME: this should be added to a callback
                    (_, item) => ({
                        countryId: item.country,
                        localUnitId: item.id,
                        status: item.status,
                        localUnitType: item.type,
                        isBulkUploadLocalUnit: isDefined(item.bulk_upload),
                        isExternallyManagedType: externallyManagedUnitByType?.[item.type],
                        localUnitName: getFirstTruthyString(
                            item.local_branch_name,
                            item.english_branch_name,
                        ),
                        onLocalUnitUpdate: refetchLocalUnits,
                    }),
                    { columnClassName: styles.actions },
                ),
            ];
        }
        return [
            createStringColumn<LocalUnitsTableListItem, number>(
                'branch_name',
                strings.localUnitsTableName,
                (item) => getFirstTruthyString(item.local_branch_name, item.english_branch_name),
            ),
            createStringColumn<LocalUnitsTableListItem, number>(
                'address',
                strings.localUnitsTableAddress,
                (item) => getFirstTruthyString(item.address_loc, item.address_en),
            ),
            createStringColumn<LocalUnitsTableListItem, number>(
                'type',
                strings.localUnitsTableType,
                (item) => item.type_details.name,
                { columnClassName: styles.type },
            ),
            createElementColumn<LocalUnitsTableListItem, number, LocalUnitsTableActionsProps>(
                'actions',
                '',
                LocalUnitsTableActions,
                // FIXME: this should be added to a callback
                (_, item) => ({
                    countryId: item.country,
                    localUnitId: item.id,
                    status: item.status,
                    isBulkUploadLocalUnit: isDefined(item.bulk_upload),
                    isExternallyManagedType: externallyManagedUnitByType?.[item.type],
                    localUnitName: getFirstTruthyString(
                        item.local_branch_name,
                        item.english_branch_name,
                    ),
                    localUnitType: item.type,
                    onLocalUnitUpdate: refetchLocalUnits,
                }),
                { columnClassName: styles.actions },
            ),
        ];
    }, [
        externallyManagedUnitByType,
        hasAddEditLocalUnitPermission,
        strings.localUnitsTableAddress,
        strings.localUnitsTableName,
        strings.localUnitsTableType,
        strings.localUnitsTableStatus,
        refetchLocalUnits,
    ]);

    return (
        <Container
            footerActions={isDefined(localUnitsResponse)
                && isDefined(localUnitsResponse.count) && (
                <Pager
                    activePage={page}
                    itemsCount={localUnitsResponse.count}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                pending={localUnitsPending || externallyManagedLocalUnitsPending}
                filtered={filtered}
                errored={isDefined(localUnitsError)}
                className={styles.table}
                columns={columns}
                keySelector={numericIdSelector}
                data={localUnitsResponse?.results}
            />
        </Container>
    );
}

export default LocalUnitsTable;
