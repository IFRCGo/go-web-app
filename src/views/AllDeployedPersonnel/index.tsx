import {
    useMemo,
    useCallback,
} from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import {
    DownloadTwoLineIcon,
} from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import NumberOutput from '#components/NumberOutput';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Page from '#components/Page';
import Button from '#components/Button';
import {
    SortContext,
} from '#components/Table/useSorting';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import Table from '#components/Table';
import useFilterState from '#hooks/useFilterState';

import i18n from './i18n.json';

type PersonnelTableItem = NonNullable<GoApiResponse<'/api/v2/personnel/'>['results']>[number];
function keySelector(personnel: PersonnelTableItem) {
    return personnel.id;
}
const now = new Date().toISOString();

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
    } = useFilterState<object>({
        filter: {},
        pageSize: 10,
    });

    const getTypeName = useCallback((type: PersonnelTableItem['type']) => {
        if (type === 'rr') {
            return strings.rapidResponse;
        }
        return type.toUpperCase();
    }, [strings]);

    const query = useMemo(() => ({
        limit,
        offset,
        ordering,
        end_date__gt: now,
    }), [
        limit,
        offset,
        ordering,
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
            createLinkColumn<PersonnelTableItem, number>(
                'country_from',
                strings.personnelTableDeployingParty,
                (item) => (
                    item.country_from?.society_name
                    || item.country_from?.name
                ),
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country_from?.id },
                }),
                { sortable: true },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'deployment',
                strings.personnelTableDeployedTo,
                (item) => item.country_to?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country_to?.id },
                }),
                { sortable: true },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'deployment',
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
            strings,
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
        onFailure: (err) => {
            // eslint-disable-next-line no-console
            console.error('Failed to download!', err);
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

    const exportButtonLabel = useMemo(() => {
        if (!pendingExport) {
            return strings.exportTableButtonLabel;
        }
        return resolveToComponent(
            strings.exportTableDownloadingButtonLabel,
            {
                progress: (
                    <NumberOutput
                        value={progress * 100}
                        maximumFractionDigits={0}
                    />
                ),
            },
        );
    }, [
        strings.exportTableButtonLabel,
        strings.exportTableDownloadingButtonLabel,
        progress,
        pendingExport,
    ]);

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
                    <Button
                        name={undefined}
                        onClick={handleExportClick}
                        variant="secondary"
                        icons={<DownloadTwoLineIcon />}
                        disabled={(personnelResponse?.count ?? 0) < 1}
                    >
                        {exportButtonLabel}
                    </Button>
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
                        filtered={false}
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
