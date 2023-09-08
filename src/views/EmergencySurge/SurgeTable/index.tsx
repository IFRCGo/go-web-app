import {
    useMemo,
    useState,
    useCallback,
} from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { getDuration } from '#utils/common';
import { numericIdSelector } from '#utils/selectors';

import i18n from './i18n.json';

type SurgeResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeListItem = NonNullable<SurgeResponse['results']>[number];
const ITEM_PER_PAGE = 5;
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

interface Props {
    emergencyId?: string;
}

export default function SurgeTable(props: Props) {
    const { emergencyId } = props;
    const strings = useTranslation(i18n);
    const [projectActivePage, setProjectActivePage] = useState(1);

    const {
        response: surgeResponse,
        pending: surgeResponsePending,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            event: Number(emergencyId),
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (projectActivePage - 1),
        },
    });

    const getStatus = useCallback(
        (alert: SurgeListItem) => {
            if (alert.is_stood_down) {
                return strings.surgeAlertStoodDown;
            }
            const closed = isDefined(alert.end) ? new Date(alert.end).getTime() < today : undefined;
            return closed ? strings.surgeAlertClosed : strings.surgeAlertOpen;
        },
        [strings],
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
                    if (isNotDefined(item.created_at) || isNotDefined(item.end)) {
                        return undefined;
                    }

                    const alertDate = new Date(item.created_at);
                    const deadline = new Date(item.end);
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

                    // FIXME: use translations
                    const duration = startDate.getTime() < nowMs
                        ? 'Immediately'
                        // FIXME: we should use toLocaleString instead
                        : startDate.toISOString();

                    return duration;
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
        [strings, getStatus],
    );

    return (
        <Container
            heading={strings.surgeAlertHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={projectActivePage}
                    onActivePageChange={setProjectActivePage}
                    itemsCount={surgeResponse?.count ?? 0}
                    maxItemsPerPage={ITEM_PER_PAGE}
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
