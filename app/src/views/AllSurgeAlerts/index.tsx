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

    const [countryFilter, setCountryFilter] = useUrlSearchState<number | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const [eventFilter, setEventFilter] = useUrlSearchState<number | undefined>(
        'event',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
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
        },
    });

    const alert = useAlert();
    const getStatus = useCallback(
        (surgeAlert: SurgeListItem) => {
            if (surgeAlert.is_stood_down) {
                return strings.surgeAlertStoodDown;
            }
            const endDate = isDefined(surgeAlert.end)
                ? new Date(surgeAlert.end)
                : undefined;

            const closed = isDefined(endDate)
                ? endDate.getTime() < nowTimestamp
                : false;

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
        { numSurgeAlerts: <NumberOutput value={surgeResponse?.count} invalidText="--" /> },
    );

    return (
        <Page
            className={styles.allSurgeAlerts}
            title={strings.allSurgeAlertsTitle}
            heading={heading}
        >
            <Container
                withHeaderBorder
                withGridViewInFilter
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
