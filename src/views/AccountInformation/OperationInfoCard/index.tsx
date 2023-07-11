import { _cs } from '@togglecorp/fujs';

import Header from '#components/Header';
import Button from '#components/Button';
import TextOutput from '#components/TextOutput';

import useTranslation from '#hooks/useTranslation';
import { useLazyRequest } from '#utils/restRequest';
import type { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetOperations = paths['/api/v2/event/']['get'];
type OperationsResponse = NonNullable<GetOperations['responses']['200']['content']['application/json']['results']>[number];

export interface Props {
    className?: string;
    operationsData: OperationsResponse;
    subscriptionMap: Record<number, boolean>,
    pending: boolean;
    retriggerSubscription: () => void,
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
        pending,
        retriggerSubscription: requestSubscriptionRetrigger,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: addSubscriptionPending,
        trigger: triggerAddSubscription,
    } = useLazyRequest({
        method: 'POST',
        body: (eventId) => ([{
            type: 'followedEvent',
            value: eventId,
        }]),
        url: 'api/v2/add_subscription/',
        onSuccess: requestSubscriptionRetrigger,
    });

    const {
        pending: removeSubscriptionPending,
        trigger: triggerRemoveSubscription,
    } = useLazyRequest({
        method: 'POST',
        body: (eventId) => ([{
            value: eventId,
        }]),
        url: 'api/v2/del_subscription/',
        onSuccess: requestSubscriptionRetrigger,
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
                    disabled={pending || subscriptionPending}
                    onClick={isSubscribed ? triggerRemoveSubscription : triggerAddSubscription}
                >
                    {isSubscribed ? strings.operationUnfollow : strings.operationFollow}
                </Button>
            )}
        >
            <TextOutput
                label={strings.operationLastUpdated}
                value={updated_at}
                valueType="date"
            />
        </Header>
    );
}

export default OperationInfoCard;
