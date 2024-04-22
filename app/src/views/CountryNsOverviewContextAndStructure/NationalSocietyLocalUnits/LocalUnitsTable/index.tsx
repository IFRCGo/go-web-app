import { useMemo } from 'react';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createBooleanColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type LocalUnitsTableResponse = GoApiResponse<'/api/v2/local-units/'>;
type LocalUnitsTableListItem = NonNullable<LocalUnitsTableResponse['results']>[number];

const localUnitsKeySelector = (option: LocalUnitsTableListItem) => option.id;

interface Props {
    filter : {
        type?: number;
        search?: string;
        isValidated?: string;
    }
}

function LocalUnitsTable(props: Props) {
    const {
        filter,
    } = props;
    const strings = useTranslation(i18n);

    const {
        limit,
        offset,
        page,
        setPage,
    } = useFilterState({
        filter: {},
        pageSize: 5,
    });

    const {
        pending: localUnitsTablePending,
        response: localUnitsTableResponse,
    } = useRequest({
        url: '/api/v2/local-units/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            type__code: filter?.type,
            validated: isDefined(filter?.isValidated)
                ? filter.isValidated === strings.localUnitsTableValidated : undefined,
            search: filter?.search,
        },
    });

    const columns = useMemo(
        () => ([
            createStringColumn<LocalUnitsTableListItem, string>(
                'english_branch_name',
                strings.localUnitsTableName,
                (item) => item.english_branch_name,
            ),
            createStringColumn<LocalUnitsTableListItem, string>(
                'address_en',
                strings.localUnitsTableAddress,
                (item) => item.address_en,
            ),
            createStringColumn<LocalUnitsTableListItem, string>(
                'type',
                strings.localUnitsTableType,
                (item) => item.type.name,
            ),
            createStringColumn<LocalUnitsTableListItem, string>(
                'focal',
                strings.localUnitsTableFocal,
                (item) => item.focal_person_en,
            ),
            createStringColumn<LocalUnitsTableListItem, string>(
                'phone',
                strings.localUnitsTablePhoneNumber,
                (item) => item.phone,
            ),
            createStringColumn<LocalUnitsTableListItem, string>(
                'email',
                strings.localUnitsTableEmail,
                (item) => item.email,
            ),
            createBooleanColumn<LocalUnitsTableListItem, boolean>(
                'validate',
                strings.localUnitsTableValidate,
                (item) => item.validated,
            ),
        ].filter(isDefined)),
        [
            strings.localUnitsTableAddress,
            strings.localUnitsTableName,
            strings.localUnitsTableType,
            strings.localUnitsTableFocal,
            strings.localUnitsTablePhoneNumber,
            strings.localUnitsTableEmail,
            strings.localUnitsTableValidate,
        ],
    );

    const isFilterApplied = isDefined(filter);

    return (
        <Container
            footerContent={(
                <Pager
                    activePage={page}
                    itemsCount={localUnitsTableResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            contentViewType="vertical"
        >
            <Table
                pending={localUnitsTablePending}
                filtered={isFilterApplied}
                className={styles.table}
                columns={columns}
                keySelector={localUnitsKeySelector}
                data={localUnitsTableResponse?.results?.filter(isDefined)}
            />
        </Container>
    );
}

export default LocalUnitsTable;
