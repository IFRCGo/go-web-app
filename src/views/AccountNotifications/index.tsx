import { useCallback, useMemo, useState } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

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

const ITEM_PER_PAGE = 5;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const [page, setPage] = useState(1);
    const {
        error: subscribedEventsResponseError,
        response: subscribedEventsResponse,
        pending: subscribedEventsResponsePending,
        retrigger: updateSubscribedEventsResponse,
    } = useRequest({
        url: '/api/v2/event/',
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (page - 1),
            is_subscribed: true,
        },
        preserveResponse: true,
    });

    const lastItemIndex = useMemo(
        () => {
            if (
                isNotDefined(subscribedEventsResponse)
                    || isNotDefined(subscribedEventsResponse.count)
            ) {
                return undefined;
            }

            const offset = ITEM_PER_PAGE * (page - 1);
            const remaining = subscribedEventsResponse.count - offset;

            if (remaining > ITEM_PER_PAGE) {
                return ITEM_PER_PAGE - 1;
            }

            return remaining - 1;
        },
        [page, subscribedEventsResponse],
    );

    const rendererParams = useCallback(
        (_: number, operation: NonNullable<OperationsResponse['results']>[number], i: number): OperationListItemProps => ({
            eventItem: operation,
            updateSubscibedEvents: updateSubscribedEventsResponse,
            isLastItem: i === lastItemIndex,
        }),
        [updateSubscribedEventsResponse, lastItemIndex],
    );

    const eventList = subscribedEventsResponse?.results;

    return (
        <div className={styles.accountNotifications}>
            <Container
                className={styles.operationsFollowing}
                heading={strings.operationFollowingHeading}
                headerDescription={strings.operationFollowingHeadingDescription}
                withHeaderBorder
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={subscribedEventsResponse?.count ?? 0}
                        maxItemsPerPage={ITEM_PER_PAGE}
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
