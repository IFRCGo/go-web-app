import { useContext, useMemo, useState } from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import { numericIdSelector } from '#utils/selectors';
import { getDuration } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SurgeResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeListItem = NonNullable<SurgeResponse['results']>[number];

const ITEM_PER_PAGE = 15;
type TableKey = number;
const today = new Date().getTime();

function getPositionString(alert: SurgeListItem) {
    if (isNotDefined(alert.molnix_id)) {
        return alert.message;
    }
    return alert.message?.split(',')[0];
}

function getMolnixKeywords(molnixTags: SurgeListItem['molnix_tags']) {
    return molnixTags.filter((tag) => !tag.name.startsWith('OP-')).map((tag) => tag.name).join(', ');
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [projectActivePage, setProjectActivePage] = useState(1);

    const {
        response: surgeResponse,
        pending: surgeResponsePending,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (projectActivePage - 1),
        },
    });

    const {
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    function getStatus(alert: SurgeListItem) {
        if (alert.is_stood_down) {
            return strings.surgeAlertStoodDown;
        }
        const closed = isDefined(alert.end) ? new Date(alert.end).getTime() < today : undefined;
        return closed ? strings.surgeAlertClosed : strings.surgeAlertOpen;
    }

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

                    const duration = startDate.getTime() < nowMs ? 'Immediately' : startDate.toISOString();

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
                    to: isDefined(item.event)
                        ? generatePath(
                            emergencyRoute.absolutePath,
                            { emergencyId: item.event?.id },
                        ) : undefined,
                }),
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'country',
                strings.surgeAlertCountry,
                (item) => item.country?.name,
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'status',
                strings.surgeAlertStatus,
                (item) => getStatus(item),
            ),
        ]),
        [strings, emergencyRoute.absolutePath],
    );

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
        </Page>
    );
}

Component.displayName = 'AllSurgeAlerts';
