import { useCallback } from 'react';
import {
    Container,
    ListView,
    Pager,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import OperationListItem, { type Props as OperationListItemProps } from '#components/domain/OperationListItem';
import TabPage from '#components/TabPage';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import EmailPreferences from './EmailPreferences';
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
        ): OperationListItemProps => ({
            eventItem: operation,
            updateSubscribedEvents: updateSubscribedEventsResponse,
        }),
        [updateSubscribedEventsResponse],
    );

    const eventList = subscribedEventsResponse?.results;

    return (
        <TabPage>
            <EmailPreferences />
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
                pending={subscribedEventsResponsePending}
                errored={isDefined(subscribedEventsResponseError)}
                empty={isNotDefined(eventList) || eventList?.length === 0}
            >
                <ListView
                    layout="block"
                    spacing="xl"
                >
                    <RawList
                        data={eventList}
                        keySelector={numericIdSelector}
                        renderer={OperationListItem}
                        rendererParams={rendererParams}
                    />
                </ListView>
            </Container>
            <SubscriptionPreferences />
        </TabPage>
    );
}

Component.displayName = 'AccountNotifications';
