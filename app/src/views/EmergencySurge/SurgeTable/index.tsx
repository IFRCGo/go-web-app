import { useMemo } from 'react';
import {
    Container,
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
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import {
    SURGE_ALERT_STATUS_OPEN,
    SURGE_ALERT_STATUS_STOOD_DOWN,
} from '#utils/constants';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
            ordering: 'molnix_status,-opens',
            molnix_status: [`${SURGE_ALERT_STATUS_OPEN}`, `${SURGE_ALERT_STATUS_STOOD_DOWN}`],
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
                        const dateStarted = startDate.getTime() < nowTimestamp
                            ? strings.emergencySurgeImmediately
                            : formatDate(startDate);

                        return dateStarted;
                    }
                    return undefined;
                },
                { cellRendererClassName: styles.startColumn },
            ),
            createStringColumn<SurgeListItem, number>(
                'message',
                strings.surgeAlertPosition,
                (item) => getPositionString(item),
            ),
            createStringColumn<SurgeListItem, number>(
                'molnix_tags',
                strings.surgeAlertKeywords,
                (item) => getMolnixKeywords(item.molnix_tags),
            ),
            createLinkColumn<SurgeListItem, number>(
                'event',
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
                'molnix_status',
                strings.surgeAlertStatus,
                (item) => item.molnix_status_display,
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
