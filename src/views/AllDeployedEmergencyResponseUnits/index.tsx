import {
    useMemo,
    useCallback,
} from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Page from '#components/Page';
import ExportButton from '#components/domain/ExportButton';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import useAlert from '#hooks/useAlert';
import SelectInput from '#components/SelectInput';
import {
    SortContext,
} from '#components/Table/useSorting';
import {
    createStringColumn,
    createLinkColumn,
    createNumberColumn,
} from '#components/Table/ColumnShortcuts';
import Table from '#components/Table';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';

import i18n from './i18n.json';

type EruTableItem = NonNullable<GoApiResponse<'/api/v2/eru/'>['results']>[number];
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EruTypeOption = NonNullable<GlobalEnumsResponse['deployments_eru_type']>[number];

function keySelector(personnel: EruTableItem) {
    return personnel.id;
}
function eruTypeKeySelector(option: EruTypeOption) {
    return option.key;
}
function eruTypeLabelSelector(option: EruTypeOption) {
    return option.value;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        rawFilter,
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
    } = useFilterState<{
        eruType?: EruTypeOption['key']
    }>({
        filter: {},
        pageSize: 10,
    });

    const alert = useAlert();
    const {
        deployments_eru_type: eruTypeOptions,
    } = useGlobalEnums();

    const eruTypes = useMemo(
        () => (
            listToMap(
                eruTypeOptions,
                (item) => item.key,
                (item) => item.value,
            )
        ),
        [eruTypeOptions],
    );

    const getEruType = useCallback(
        (id: EruTableItem['type']) => {
            if (isNotDefined(id) || isNotDefined(eruTypes)) {
                return undefined;
            }
            return eruTypes[id];
        },
        [eruTypes],
    );

    // FIXME: Add types
    const query = useMemo(() => ({
        limit,
        offset,
        ordering,
        deployed_to__isnull: false,
        type: filter.eruType,
    }), [
        limit,
        offset,
        ordering,
        filter,
    ]);

    const {
        response: eruResponse,
        pending: eruPending,
    } = useRequest({
        url: '/api/v2/eru/',
        preserveResponse: true,
        query,
    });

    const columns = useMemo(
        () => ([
            createStringColumn<EruTableItem, number>(
                'eru_owner__national_society_country__society_name',
                strings.eruTableName,
                (item) => item.eru_owner.national_society_country.society_name
                        ?? item.eru_owner.national_society_country.name,
                { sortable: true },
            ),
            createStringColumn<EruTableItem, number>(
                'type',
                strings.eruTableType,
                (item) => getEruType(item.type),
                { sortable: true },
            ),
            createNumberColumn<EruTableItem, number>(
                'units',
                strings.eruTablePersonnel,
                (item) => item.units,
                { sortable: true },
            ),
            createNumberColumn<EruTableItem, number>(
                'equipment_units',
                strings.eruTableEquipment,
                (item) => item.equipment_units,
                { sortable: true },
            ),
            createLinkColumn<EruTableItem, number>(
                'deployed_to__society_name',
                strings.eruTableCountry,
                (item) => item.deployed_to.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: {
                        countryId: item.deployed_to?.id,
                    },
                }),
                { sortable: true },
            ),
            createLinkColumn<EruTableItem, number>(
                'event__name',
                strings.eruTableEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: {
                        emergencyId: item.event?.id,
                    },
                }),
                { sortable: true },
            ),
        ]),
        [strings, getEruType],
    );
    const containerHeading = resolveToComponent(
        strings.containerHeading,
        {
            count: eruResponse?.count ?? 0,
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
            saveAs(blob, 'deployed-erus.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!eruResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/eru/',
            eruResponse?.count,
            query,
        );
    }, [
        query,
        triggerExportStart,
        eruResponse?.count,
    ]);

    return (
        <Page>
            <Container
                heading={containerHeading}
                withHeaderBorder
                filters={(
                    <SelectInput
                        placeholder={strings.eruTableFilterTypePlaceholder}
                        label={strings.eruFilterType}
                        name="eruType"
                        value={rawFilter.eruType}
                        onChange={setFilterField}
                        keySelector={eruTypeKeySelector}
                        labelSelector={eruTypeLabelSelector}
                        options={eruTypeOptions}
                    />
                )}
                withGridViewInFilter
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={eruResponse?.count}
                    />
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={eruResponse?.count ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        filtered={filtered}
                        pending={eruPending}
                        data={eruResponse?.results}
                        keySelector={keySelector}
                        columns={columns}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllDeployedEmergencyResponseUnits';
