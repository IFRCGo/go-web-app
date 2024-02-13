import {
    useMemo,
} from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import Link from '#components/Link';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { getDuration, formatDate } from '#utils/common';
import { numericIdSelector } from '#utils/selectors';
import useFilterState from '#hooks/useFilterState';
import { SURGE_ALERT_STATUS_CLOSED } from '#utils/constants';

import i18n from './i18n.json';

type SurgeResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeListItem = NonNullable<SurgeResponse['results']>[number];
const now = new Date();
const nowTimestamp = now.getTime();

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

interface Props {
    emergencyId?: string;
}

export default function SurgeTable(props: Props) {
    const { emergencyId } = props;
    const strings = useTranslation(i18n);
    const {
        page: projectActivePage,
        setPage: setProjectActivePage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 5,
    });

    const {
        response: surgeResponse,
        pending: surgeResponsePending,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            event: Number(emergencyId),
            limit,
            offset,

            // FIXME: this should come from the useFilterState
            ordering: 'status,-opens',

            // NOTE: following filters are required
            is_active: true,
            end__gte: now.toISOString(),
        },
    });

    const columns = useMemo(
        () => ([
            createDateColumn<SurgeListItem, number>(
                'opens',
                strings.surgeAlertDate,
                (item) => item.opens,
            ),
            createStringColumn<SurgeListItem, number>(
                'duration',
                strings.surgeAlertDuration,
                (item) => {
                    if (isNotDefined(item.start) || isNotDefined(item.end)) {
                        return undefined;
                    }

                    const startDate = new Date(item.start);
                    const endDate = new Date(item.end);

                    if (startDate > endDate) {
                        return undefined;
                    }

                    const duration = getDuration(startDate, endDate);

                    return duration;
                },
            ),
            createStringColumn<SurgeListItem, number>(
                'start',
                strings.surgeAlertStartDate,
                (item) => {
                    const startDate = isDefined(item.start) ? new Date(item.start) : undefined;

                    if (isDefined(startDate)) {
                        if (item.status === SURGE_ALERT_STATUS_CLOSED) {
                            return formatDate(startDate);
                        }

                        const dateStarted = startDate.getTime() < nowTimestamp
                            ? strings.emergencySurgeImmediately
                            : formatDate(startDate);

                        return dateStarted;
                    }
                    return undefined;
                },
            ),
            createStringColumn<SurgeListItem, number>(
                'name',
                strings.surgeAlertPosition,
                (item) => getPositionString(item),
            ),
            createStringColumn<SurgeListItem, number>(
                'keywords',
                strings.surgeAlertKeywords,
                (item) => getMolnixKeywords(item.molnix_tags),
            ),
            createLinkColumn<SurgeListItem, number>(
                'emergency',
                strings.surgeAlertEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event?.id },
                }),
            ),
            createLinkColumn<SurgeListItem, number>(
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
            createStringColumn<SurgeListItem, number>(
                'status',
                strings.surgeAlertStatus,
                (item) => item.status_display,
            ),
        ]),
        [
            strings.surgeAlertDate,
            strings.surgeAlertDuration,
            strings.surgeAlertStartDate,
            strings.surgeAlertPosition,
            strings.surgeAlertKeywords,
            strings.surgeAlertEmergency,
            strings.surgeAlertCountry,
            strings.surgeAlertStatus,
            strings.emergencySurgeImmediately,
        ],
    );

    return (
        <Container
            heading={strings.surgeAlertHeading}
            withHeaderBorder
            actions={(
                <Link
                    to="allSurgeAlerts"
                    withLinkIcon
                    withUnderline
                    urlSearch={isDefined(emergencyId) ? `event=${emergencyId}` : undefined}
                >
                    {strings.surgeAlertsViewAllForCurrentEmergency}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={projectActivePage}
                    onActivePageChange={setProjectActivePage}
                    itemsCount={surgeResponse?.count ?? 0}
                    maxItemsPerPage={limit}
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
    );
}
