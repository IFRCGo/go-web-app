import {
    useMemo,
    useCallback,
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
import { getDuration } from '#utils/common';
import { numericIdSelector } from '#utils/selectors';
import useFilterState from '#hooks/useFilterState';

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

            // NOTE: following filters are required
            is_active: true,
            end__gte: now.toISOString(),
        },
    });

    const getStatus = useCallback(
        (alert: SurgeListItem) => {
            if (alert.is_stood_down) {
                return strings.surgeAlertStoodDown;
            }
            const closed = isDefined(alert.end)
                ? new Date(alert.end).getTime() < nowTimestamp
                : undefined;
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
            createDateColumn<SurgeListItem, number>(
                'created_at',
                strings.surgeAlertDate,
                (item) => item.created_at,
            ),
            createStringColumn<SurgeListItem, number>(
                'duration',
                strings.surgeAlertDuration,
                (item) => {
                    if (isNotDefined(item.start) || isNotDefined(item.end)) {
                        return undefined;
                    }

                    const alertDate = new Date(item.start);
                    const deadline = new Date(item.end);

                    if (alertDate > deadline) {
                        return undefined;
                    }

                    const duration = getDuration(alertDate, deadline);

                    return duration;
                },
            ),
            createStringColumn<SurgeListItem, number>(
                'start',
                strings.surgeAlertStartDate,
                (item) => {
                    if (isNotDefined(item.start)) {
                        return undefined;
                    }

                    const startDate = new Date(item.start);
                    const nowMs = new Date().getTime();

                    const start = startDate.getTime() < nowMs
                        ? strings.emergencySurgeImmediately
                        : startDate.toLocaleString();

                    return start;
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
                (item) => getStatus(item),
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
            getStatus,
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
