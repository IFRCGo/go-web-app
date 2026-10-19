import {
    useMemo,
    useState,
} from 'react';
import {
    Container,
    NumberOutput,
    Pager,
    Table,
    TextInput,
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
import EventSearchSelectInput, { type EventItem } from '#components/domain/EventSearchSelectInput';
import ExportButton from '#components/domain/ExportButton';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useFilterState, { type UrlParams } from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { SURGE_ALERT_STATUS_CLOSED } from '#utils/constants';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import urlParam from '#utils/urlParam';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SurgeResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeListItem = NonNullable<SurgeResponse['results']>[number];

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

interface SurgeAlertFilter {
    country?: number;
    event?: number;
    position?: string;
    keywords?: string;
}

const surgeAlertUrlParams: UrlParams<SurgeAlertFilter> = {
    country: urlParam.number('country'),
    event: urlParam.number('event'),
    position: urlParam.text('position'),
    keywords: urlParam.text('keywords'),
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        limit,
        offset,
        rawFilter,
        filter,
        setFilterField,
        filtered,
    } = useFilterState<SurgeAlertFilter>({
        filter: {},
        urlParams: surgeAlertUrlParams,
        pageSize: 15,
    });

    const [eventOptions, setEventOptions] = useState<
        EventItem[] | undefined | null
    >([]);

    const surgeAlertQuery = {
        event: filter.event,
        country: filter.country,
        // NOTE: the URL keeps the text as typed so that the input can show it
        message__icontains: filter.position?.trim() || undefined,
        molnix_tag_name: filter.keywords?.trim() || undefined,
        // FIXME: this should come from useFilterState
        ordering: 'molnix_status,-opens',
    };

    useRequest({
        skip: isNotDefined(rawFilter.event)
            || (!!eventOptions?.find((event) => event.id === rawFilter.event)),
        url: '/api/v2/event/{id}/',
        pathVariables: isDefined(rawFilter.event) ? {
            id: rawFilter.event,
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
            ...surgeAlertQuery,
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
                { columnClassName: styles.countryColumn },
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

    const handleExportClick = () => {
        if (!surgeResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/surge_alert/',
            surgeResponse.count,
            surgeAlertQuery,
        );
    };

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
                            value={rawFilter.country}
                            onChange={setFilterField}
                        />
                        <EventSearchSelectInput
                            name="event"
                            label={strings.eventFilterLabel}
                            placeholder={strings.defaultPlaceholder}
                            value={rawFilter.event}
                            onChange={setFilterField}
                            options={eventOptions}
                            onOptionsChange={setEventOptions}
                            countryId={rawFilter.country}
                        />
                        <TextInput
                            name="position"
                            label={strings.positionFilterLabel}
                            placeholder={strings.defaultPlaceholder}
                            value={rawFilter.position}
                            onChange={setFilterField}
                        />
                        <TextInput
                            name="keywords"
                            label={strings.keywordsFilterLabel}
                            placeholder={strings.defaultPlaceholder}
                            value={rawFilter.keywords}
                            onChange={setFilterField}
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
                headerActions={(
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
                    filtered={filtered}
                    data={surgeResponse?.results}
                    columns={columns}
                    keySelector={numericIdSelector}
                />
            </Container>
        </Page>
    );
}

Component.displayName = 'AllSurgeAlerts';
