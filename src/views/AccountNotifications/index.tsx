import { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';

import useFilterState from '#hooks/useFilterState';
import List from '#components/List';
import Pager from '#components/Pager';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';

import OperationListItem, { type Props as OperationListItemProps } from './OperationListItem';
import SubscriptionPreferences from './SubscriptionPreferences';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OperationsResponse = GoApiResponse<'/api/v2/event/'>;

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
        pageSize: 5,
    });

    const {
        error: subscribedEventsResponseError,
        response: subscribedEventsResponse,
        pending: subscribedEventsResponsePending,
        retrigger: updateSubscribedEventsResponse,
    } = useRequest({
        url: '/api/v2/event/',
        query: {
            limit,
            offset,
            is_subscribed: true,
        },
        preserveResponse: true,
    });

    const rendererParams = useCallback(
        (
            _: number,
            operation: NonNullable<OperationsResponse['results']>[number],
            i: number,
            data: unknown[],
        ): OperationListItemProps => ({
            eventItem: operation,
            updateSubscibedEvents: updateSubscribedEventsResponse,
            isLastItem: i === (data.length - 1),
        }),
        [updateSubscribedEventsResponse],
    );

    const eventList = subscribedEventsResponse?.results;

    return (
        <div className={styles.accountNotifications}>
            <Container
                className={styles.operationsFollowing}
                heading={strings.operationFollowingHeading}
                withHeaderBorder
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={subscribedEventsResponse?.count ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <List
                    className={styles.operationsList}
                    data={eventList}
                    pending={subscribedEventsResponsePending}
                    errored={isDefined(subscribedEventsResponseError)}
                    filtered={false}
                    keySelector={numericIdSelector}
                    renderer={OperationListItem}
                    rendererParams={rendererParams}
                />
            </Container>
            <SubscriptionPreferences />
        </div>
    );
}

Component.displayName = 'AccountNotifications';
