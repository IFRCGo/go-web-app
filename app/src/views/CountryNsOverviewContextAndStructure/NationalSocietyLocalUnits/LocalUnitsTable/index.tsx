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
} from '@togglecorp/fujs';

import usePermissions from '#hooks/domain/usePermissions';
import useFilterState from '#hooks/useFilterState';
import { getFirstTruthyString } from '#utils/common';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { VALIDATED } from '../common';
import type { FilterValue } from '../Filters';
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
    const { isSuperUser, isCountryAdmin, isRegionAdmin } = usePermissions();
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const hasAddEditLocalUnitPermission = isSuperUser
        || isCountryAdmin(countryResponse?.id)
        || isRegionAdmin(Number(countryResponse?.region));

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
            validated: isDefined(filter?.isValidated)
                ? filter.isValidated === VALIDATED : undefined,
            search: filter?.search,
            country__iso3: isDefined(countryResponse?.iso3) ? countryResponse?.iso3 : undefined,
        },
    });

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
                createStringColumn<LocalUnitsTableListItem, number>(
                    'focal',
                    strings.localUnitsTableFocal,
                    (item) => getFirstTruthyString(item.focal_person_loc, item.focal_person_en),
                ),
                createStringColumn<LocalUnitsTableListItem, number>(
                    'phone',
                    strings.localUnitsTablePhoneNumber,
                    (item) => item.phone,
                ),
                createStringColumn<LocalUnitsTableListItem, number>(
                    'email',
                    strings.localUnitsTableEmail,
                    (item) => item.email,
                ),
                createElementColumn<LocalUnitsTableListItem, number, LocalUnitsTableActionsProps>(
                    'actions',
                    '',
                    LocalUnitsTableActions,
                    // FIXME: this should be added to a callback
                    (_, item) => ({
                        countryId: item.country,
                        localUnitId: item.id,
                        isValidated: item.validated,
                        isLocked: item.is_locked,
                        localUnitName: getFirstTruthyString(
                            item.local_branch_name,
                            item.english_branch_name,
                        ),
                        onDeleteActionSuccess: refetchLocalUnits,
                        onValidationActionSuccess: refetchLocalUnits,
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
                    isValidated: item.validated,
                    isLocked: item.is_locked,
                    localUnitName: getFirstTruthyString(
                        item.local_branch_name,
                        item.english_branch_name,
                    ),
                    onDeleteActionSuccess: refetchLocalUnits,
                    onValidationActionSuccess: refetchLocalUnits,
                }),
                { columnClassName: styles.actions },
            ),
        ];
    }, [
        hasAddEditLocalUnitPermission,
        strings.localUnitsTableAddress,
        strings.localUnitsTableName,
        strings.localUnitsTableType,
        strings.localUnitsTableFocal,
        strings.localUnitsTablePhoneNumber,
        strings.localUnitsTableEmail,
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
            contentViewType="vertical"
        >
            <Table
                pending={localUnitsPending}
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
