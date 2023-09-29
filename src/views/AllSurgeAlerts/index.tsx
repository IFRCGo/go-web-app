import { useMemo, useCallback } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

import Page from '#components/Page';
import Container from '#components/Container';
import Pager from '#components/Pager';
import ExportButton from '#components/domain/ExportButton';
import Table from '#components/Table';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import useAlert from '#hooks/useAlert';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { numericIdSelector } from '#utils/selectors';
import { getDuration } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SurgeResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeListItem = NonNullable<SurgeResponse['results']>[number];

type TableKey = number;
const today = new Date().getTime();

function getPositionString(alert: SurgeListItem) {
    if (isNotDefined(alert.molnix_id)) {
        return alert.message;
    }
    return alert.message?.split(',')[0];
}

function getMolnixKeywords(molnixTags: SurgeListItem['molnix_tags']) {
    return molnixTags
        .map((tag) => tag.name)
        .filter((tag) => !tag.startsWith('OP-'))
        .filter((tag) => !['Nosuitable', 'NotSurge', 'OpsChange'].includes(tag))
        .join(', ');
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 15,
    });

    const {
        response: surgeResponse,
        pending: surgeResponsePending,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            limit,
            offset,
        },
    });

    const alert = useAlert();
    const getStatus = useCallback(
        (surgeAlert: SurgeListItem) => {
            if (surgeAlert.is_stood_down) {
                return strings.surgeAlertStoodDown;
            }
            const closed = isDefined(surgeAlert.end)
                ? new Date(surgeAlert.end).getTime() < today : undefined;
            return closed ? strings.surgeAlertClosed : strings.surgeAlertOpen;
        },
        [
            strings.surgeAlertStoodDown,
            strings.surgeAlertClosed,
            strings.surgeAlertOpen,
        ],
    );

    const columns = useMemo(
        () => ([
            createDateColumn<SurgeListItem, TableKey>(
                'created_at',
                strings.surgeAlertDate,
                (item) => item.created_at,
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'duration',
                strings.surgeAlertDuration,
                (item) => {
                    if (isNotDefined(item.created_at) || isNotDefined(item.end)) {
                        return undefined;
                    }

                    const alertDate = new Date(item.created_at);
                    const deadline = new Date(item.end);
                    const duration = getDuration(alertDate, deadline);

                    return duration;
                },
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'start',
                strings.surgeAlertStartDate,
                (item) => {
                    if (isNotDefined(item.start)) {
                        return undefined;
                    }

                    const startDate = new Date(item.start);
                    const nowMs = new Date().getTime();

                    const duration = startDate.getTime() < nowMs
                        ? strings.surgeAlertImmediately
                        : startDate.toLocaleString();

                    return duration;
                },
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'name',
                strings.surgeAlertPosition,
                (item) => getPositionString(item),
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'keywords',
                strings.surgeAlertKeywords,
                (item) => getMolnixKeywords(item.molnix_tags),
            ),
            createLinkColumn<SurgeListItem, TableKey>(
                'emergency',
                strings.surgeAlertEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event?.id },
                }),
            ),
            createLinkColumn<SurgeListItem, TableKey>(
                'country',
                strings.surgeAlertCountry,
                (item) => item.country?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: {
                        countryId: item.country?.id,
                    },
                }),
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'status',
                strings.surgeAlertStatus,
                (item) => getStatus(item),
            ),
        ]),
        [
            strings.surgeAlertImmediately,
            strings.surgeAlertDate,
            strings.surgeAlertDuration,
            strings.surgeAlertStartDate,
            strings.surgeAlertPosition,
            strings.surgeAlertKeywords,
            strings.surgeAlertEmergency,
            strings.surgeAlertCountry,
            strings.surgeAlertStatus,
            getStatus,
        ],
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
            saveAs(blob, 'surge-alerts.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!surgeResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/surge_alert/',
            surgeResponse?.count,
            {},
        );
    }, [
        triggerExportStart,
        surgeResponse?.count,
    ]);

    const heading = resolveToComponent(
        strings.allSurgeAlertsHeading,
        { numSurgeAlerts: surgeResponse?.count ?? '--' },
    );

    return (
        <Page
            className={styles.allSurgeAlerts}
            title={strings.allSurgeAlertsTitle}
            heading={heading}
        >
            <Container
                footerActions={(
                    <Pager
                        activePage={page}
                        onActivePageChange={setPage}
                        itemsCount={surgeResponse?.count ?? 0}
                        maxItemsPerPage={limit}
                    />
                )}
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={surgeResponse?.count}
                    />
                )}
            >
                <Table
                    pending={surgeResponsePending}
                    filtered={false}
                    data={surgeResponse?.results}
                    columns={columns}
                    keySelector={numericIdSelector}
                />
            </Container>
        </Page>
    );
}

Component.displayName = 'AllSurgeAlerts';
