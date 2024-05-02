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
    createBooleanColumn,
    createElementColumn,
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useFilterState from '#hooks/useFilterState';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { VALIDATED } from '../common';
import LocalUnitsTableActions, { type Props as LocalUnitsTableActionsProps } from './LocalUnitTableActions';

import i18n from './i18n.json';
import styles from './styles.module.css';

const PAGE_SIZE = 15;

type LocalUnitsTableResponse = GoApiResponse<'/api/v2/local-units/'>;
type LocalUnitsTableListItem = NonNullable<LocalUnitsTableResponse['results']>[number];

interface Props {
    filter: {
        type?: number;
        search?: string;
        isValidated?: string;
    }
}

function LocalUnitsTable(props: Props) {
    const {
        filter: filterFromProps,
    } = props;

    const strings = useTranslation(i18n);
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const {
        limit,
        offset,
        page,
        setPage,
        filtered,
        filter,
        setFilter,
    } = useFilterState({
        filter: filterFromProps,
        pageSize: PAGE_SIZE,
    });

    useEffect(() => {
        if (filterFromProps) {
            setFilter(filterFromProps);
        }
    }, [filterFromProps, setFilter]);

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

    const columns = useMemo(
        () => ([
            createStringColumn<LocalUnitsTableListItem, number>(
                'branch_name',
                strings.localUnitsTableName,
                (item) => item.local_branch_name ?? item.english_branch_name,
            ),
            createStringColumn<LocalUnitsTableListItem, number>(
                'address',
                strings.localUnitsTableAddress,
                (item) => item.address_loc ?? item.address_en,
            ),
            createStringColumn<LocalUnitsTableListItem, number>(
                'type',
                strings.localUnitsTableType,
                (item) => item.type_details.name,
            ),
            createStringColumn<LocalUnitsTableListItem, number>(
                'focal',
                strings.localUnitsTableFocal,
                (item) => item.focal_person_en,
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
            createBooleanColumn<LocalUnitsTableListItem, number>(
                'validated',
                strings.localUnitsTableValidated,
                (item) => item.validated,
            ),
            createElementColumn<LocalUnitsTableListItem, number, LocalUnitsTableActionsProps>(
                'actions',
                '',
                LocalUnitsTableActions,
                (_, item) => ({
                    localUnitId: item.id,
                    isValidated: item.validated,
                    localUnitName: item.local_branch_name ?? item.english_branch_name,
                    onActionSuccess: refetchLocalUnits,
                }),
            ),
        ]),
        [
            strings.localUnitsTableAddress,
            strings.localUnitsTableName,
            strings.localUnitsTableType,
            strings.localUnitsTableFocal,
            strings.localUnitsTablePhoneNumber,
            strings.localUnitsTableEmail,
            strings.localUnitsTableValidated,
            refetchLocalUnits,
        ],
    );

    return (
        <Container
            footerContent={isDefined(localUnitsResponse)
                && isDefined(localUnitsResponse.count) && (
                <Pager
                    activePage={page}
                    itemsCount={localUnitsResponse.count}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            footerClassName={styles.footerContent}
            contentViewType="vertical"
        >
            <Table
                pending={localUnitsPending}
                filtered={filtered}
                errored={isDefined(localUnitsError)}
                className={styles.table}
                columns={columns}
                keySelector={numericIdSelector}
                data={localUnitsResponse?.results?.filter(isDefined)}
            />
        </Container>
    );
}

export default LocalUnitsTable;
