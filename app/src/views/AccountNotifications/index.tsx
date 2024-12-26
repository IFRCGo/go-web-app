import { useCallback } from 'react';
import {
    Container,
    List,
    Pager,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import OperationListItem, { type Props as OperationListItemProps } from '#components/domain/OperationListItem';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import SubscriptionPreferences from './SubscriptionPreferences';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OperationsResponse = GoApiResponse<'/api/v2/event/'>;

/** @knipignore */
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
            updateSubscribedEvents: updateSubscribedEventsResponse,
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
