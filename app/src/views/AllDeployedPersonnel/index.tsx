import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    DateInput,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createStringColumn,
    resolveToComponent,
    toDateTimeString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { COUNTRY_RECORD_TYPE_REGION } from '#utils/constants';
import { countryIdToRegionIdMap } from '#utils/domain/country';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type PersonnelTableItem = NonNullable<GoApiResponse<'/api/v2/personnel/'>['results']>[number];
function keySelector(personnel: PersonnelTableItem) {
    return personnel.id;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
        rawFilter,
        filter,
        setFilterField,
        filtered,
    } = useFilterState<{
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
        pageSize: 10,
    });
    const alert = useAlert();

    const getTypeName = useCallback((type: PersonnelTableItem['type']) => {
        if (type === 'rr') {
            return strings.rapidResponse;
        }
        return type.toUpperCase();
    }, [strings.rapidResponse]);

    const query = useMemo(() => ({
        limit,
        offset,
        ordering,
        // FIXME: The server does not support date string
        start_date__gte: toDateTimeString(filter.startDateAfter),
        start_date__lte: toDateTimeString(filter.startDateBefore),
    }), [
        limit,
        offset,
        ordering,
        filter,
    ]);

    const {
        response: personnelResponse,
        pending: personnelPending,
    } = useRequest({
        url: '/api/v2/personnel/',
        preserveResponse: true,
        query,
    });

    const columns = useMemo(
        () => ([
            createDateColumn<PersonnelTableItem, number>(
                'start_date',
                strings.personnelTableStartDate,
                (item) => item.start_date,
                { sortable: true },
            ),
            createDateColumn<PersonnelTableItem, number>(
                'end_date',
                strings.personnelTableEndDate,
                (item) => item.end_date,
                { sortable: true },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'name',
                strings.personnelTableName,
                (item) => item.name,
                { sortable: true },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'role',
                strings.personnelTablePosition,
                (item) => item.role,
                { sortable: true },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'type',
                strings.personnelTableType,
                (item) => getTypeName(item.type),
                { sortable: true },
            ),
            // NOTE:We don't have proper mapping for region
            createLinkColumn<PersonnelTableItem, number>(
                'country_from',
                strings.personnelTableDeployingParty,
                (item) => (
                    item.country_from?.society_name
                    || item.country_from?.name
                ),
                (item) => {
                    if (isNotDefined(item.country_from)) {
                        return { to: undefined };
                    }

                    const countryId = item.country_from.id;

                    if (item.country_from.record_type === COUNTRY_RECORD_TYPE_REGION) {
                        const regionId = isDefined(countryId)
                            ? countryIdToRegionIdMap[countryId]
                            : undefined;

                        return {
                            to: 'regionsLayout',
                            urlParams: { regionId },
                        };
                    }

                    return {
                        to: 'countriesLayout',
                        urlParams: { countryId },
                    };
                },
                { sortable: true },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'country_to',
                strings.personnelTableDeployedTo,
                (item) => item.country_to?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country_to?.id },
                }),
                { sortable: true },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'event_deployed_to',
                strings.personnelTableEmergency,
                (item) => item.deployment?.event_deployed_to?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: {
                        emergencyId: item.deployment?.event_deployed_to?.id,
                    },
                }),
                {
                    sortable: true,
                },
            ),
        ]),
        [
            strings.personnelTableStartDate,
            strings.personnelTableEndDate,
            strings.personnelTableName,
            strings.personnelTablePosition,
            strings.personnelTableType,
            strings.personnelTableDeployingParty,
            strings.personnelTableDeployedTo,
            strings.personnelTableEmergency,
            getTypeName,
        ],
    );

    const containerHeading = resolveToComponent(
        strings.containerHeading,
        {
            count: personnelResponse?.count ?? 0,
        },
    );

    const [
        pendingExport,
        progress,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        onFailure: () => {
            alert.show(
                strings.failedToCreateExport,
                { variant: 'danger' },
            );
        },
        onSuccess: (data) => {
            const unparseData = Papa.unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, 'all-deployed-personnel.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!personnelResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/personnel/',
            personnelResponse?.count,
            query,
        );
    }, [
        query,
        triggerExportStart,
        personnelResponse?.count,
    ]);

    return (
        <Page>
            <Container
                heading={containerHeading}
                withHeaderBorder
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={personnelResponse?.count}
                    />
                )}
                filters={(
                    <>
                        <DateInput
                            name="startDateAfter"
                            label={strings.allDeployedPersonnelFilterStartDateAfter}
                            onChange={setFilterField}
                            value={rawFilter.startDateAfter}
                        />
                        <DateInput
                            name="startDateBefore"
                            label={strings.allDeployedPersonnelFilterStartDateBefore}
                            onChange={setFilterField}
                            value={rawFilter.startDateBefore}
                        />
                    </>
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={personnelResponse?.count ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        filtered={filtered}
                        pending={personnelPending}
                        data={personnelResponse?.results}
                        keySelector={keySelector}
                        columns={columns}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllDeployedPersonnel';
