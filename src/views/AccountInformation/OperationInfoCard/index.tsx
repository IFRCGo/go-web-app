import { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import DomainContext from '#contexts/domain';
import Header from '#components/Header';
import Button from '#components/Button';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse, useLazyRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OperationsGet = GoApiResponse<'/api/v2/event/'>;
type OperationsResponse = NonNullable<OperationsGet['results']>[number];

export interface Props {
    className?: string;
    operationsData: OperationsResponse;
    subscriptionMap: Record<number, boolean>,
}

function OperationInfoCard(props: Props) {
    const {
        className,
        operationsData: {
            id,
            name,
            updated_at,
        },
        subscriptionMap,
    } = props;

    const strings = useTranslation(i18n);

    const { invalidate } = useContext(DomainContext);

    const {
        pending: addSubscriptionPending,
        trigger: triggerAddSubscription,
    } = useLazyRequest({
        method: 'POST',
        body: (eventId: number) => ([{
            type: 'followedEvent',
            value: eventId,
        }]),
        url: '/api/v2/add_subscription/',
        onSuccess: () => {
            invalidate('user-me');
        },
    });

    const {
        pending: removeSubscriptionPending,
        trigger: triggerRemoveSubscription,
    } = useLazyRequest({
        method: 'POST',
        body: (eventId: number) => ([{
            value: eventId,
        }]),
        url: '/api/v2/del_subscription/',
        onSuccess: () => {
            invalidate('user-me');
        },
    });

    const subscriptionPending = addSubscriptionPending || removeSubscriptionPending;
    const isSubscribed = subscriptionMap[id] ?? false;

    return (
        <Header
            className={_cs(styles.operationInfoCard, className)}
            heading={name}
            headingLevel={4}
            ellipsizeHeading
            actions={(
                <Button
                    name={id}
                    variant="secondary"
                    disabled={subscriptionPending}
                    onClick={isSubscribed ? triggerRemoveSubscription : triggerAddSubscription}
                >
                    {isSubscribed
                        ? strings.operationUnfollowButtonLabel
                        : strings.operationFollowButtonLabel}
                </Button>
            )}
        >
            <TextOutput
                label={strings.operationLastUpdatedLabel}
                value={updated_at}
                valueType="date"
            />
        </Header>
    );
}

export default OperationInfoCard;
