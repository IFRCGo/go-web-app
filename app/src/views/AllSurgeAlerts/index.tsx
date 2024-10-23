import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    NumberOutput,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createStringColumn,
    formatDate,
    getDuration,
    numericIdSelector,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import EventSearchSelectInput from '#components/domain/EventSearchSelectInput';
import ExportButton from '#components/domain/ExportButton';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import useUrlSearchState from '#hooks/useUrlSearchState';
import { SURGE_ALERT_STATUS_CLOSED } from '#utils/constants';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SurgeResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeListItem = NonNullable<SurgeResponse['results']>[number];

type GetEventResponse = GoApiResponse<'/api/v2/event/mini/'>;
export type EventItem = Pick<NonNullable<GetEventResponse['results']>[number], 'id' | 'name' | 'dtype'>;

type TableKey = number;
const nowTimestamp = new Date().getTime();

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

    const [countryFilter, setCountryFilter] = useUrlSearchState<number | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            if (potentialValue) {
                setPage(0);
            }
            return potentialValue;
        },
        (country) => country,
    );

    const [eventFilter, setEventFilter] = useUrlSearchState<number | undefined>(
        'event',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            if (potentialValue) {
                setPage(0);
            }
            return potentialValue;
        },
        (country) => country,
    );

    const [eventOptions, setEventOptions] = useState<
        EventItem[] | undefined | null
    >([]);

    useRequest({
        skip: isNotDefined(eventFilter)
            || (!!eventOptions?.find((event) => event.id === eventFilter)),
        url: '/api/v2/event/{id}/',
        pathVariables: isDefined(eventFilter) ? {
            id: eventFilter,
        } : undefined,
        onSuccess: (response) => {
            if (isNotDefined(response)) {
                return;
            }

            const {
                id,
                dtype,
                name,
            } = response;

            if (isNotDefined(id) || isNotDefined(dtype) || isNotDefined(name)) {
                return;
            }

            const newOption = {
                id,
                dtype: {
                    id: dtype,
                    translation_module_original_language: 'en' as const,
                    name: undefined,
                    summary: undefined,
                },
                name,
            };

            setEventOptions((prevOptions) => ([
                ...prevOptions ?? [],
                newOption,
            ]));
        },
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
            event: eventFilter,
            country: countryFilter,

            // FIXME: this should come from the useFilterState
            ordering: 'molnix_status,-opens',
        },
    });

    const alert = useAlert();

    const columns = useMemo(
        () => ([
            createDateColumn<SurgeListItem, TableKey>(
                'opens',
                strings.surgeAlertDate,
                (item) => item.opens,
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'duration',
                strings.surgeAlertDuration,
                (item) => {
                    if (isNotDefined(item.start) || isNotDefined(item.end)) {
                        return undefined;
                    }

                    const startDate = new Date(item.start);
                    const endDate = new Date(item.end);
                    const duration = getDuration(startDate, endDate);

                    return duration;
                },
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'start',
                strings.surgeAlertStartDate,
                (item) => {
                    const startDate = isDefined(item.start) ? new Date(item.start) : undefined;

                    if (isDefined(startDate)) {
                        if (item.molnix_status === SURGE_ALERT_STATUS_CLOSED) {
                            return formatDate(startDate);
                        }

                        const dateStarted = startDate.getTime() < nowTimestamp
                            ? strings.surgeAlertImmediately
                            : formatDate(startDate);

                        return dateStarted;
                    }
                    return undefined;
                },
                { cellRendererClassName: styles.startColumn },
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'message',
                strings.surgeAlertPosition,
                (item) => getPositionString(item),
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'molnix_tags',
                strings.surgeAlertKeywords,
                (item) => getMolnixKeywords(item.molnix_tags),
            ),
            createLinkColumn<SurgeListItem, TableKey>(
                'event',
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
                'molnix_status',
                strings.surgeAlertStatus,
                (item) => item.molnix_status_display,
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
        { numSurgeAlerts: <NumberOutput value={surgeResponse?.count} invalidText="--" /> },
    );

    return (
        <Page
            title={strings.allSurgeAlertsTitle}
            heading={heading}
        >
            <Container
                withHeaderBorder
                filters={(
                    <>
                        <CountrySelectInput
                            name="country"
                            label={strings.countryFilterLabel}
                            placeholder={strings.defaultPlaceholder}
                            value={countryFilter}
                            onChange={setCountryFilter}
                        />
                        <EventSearchSelectInput
                            name="event"
                            label={strings.eventFilterLabel}
                            placeholder={strings.defaultPlaceholder}
                            value={eventFilter}
                            onChange={setEventFilter}
                            options={eventOptions}
                            onOptionsChange={setEventOptions}
                            countryId={countryFilter}
                        />
                    </>
                )}
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
