import { _cs } from '@togglecorp/fujs';

import Header from '#components/Header';
import Button from '#components/Button';
import DateOutput from '#components/DateOutput';
import { Emergency } from '#types/emergency';
import useTranslation from '#hooks/useTranslation';
import { useLazyRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    data: Emergency;
    subscriptionMap: Record<number, boolean>,
    pending: boolean;
    retriggerSubscription: () => void,
}

function OperationInfoCard(props: Props) {
    const {
        className,
        data: {
            id,
            name,
            updated_at,
        },
        subscriptionMap,
        pending,
        retriggerSubscription: requestSubscriptionRetrigger,
    } = props;

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

    const strings = useTranslation(i18n);

    const isSubscribed = subscriptionMap[id] ?? false;

    return (
        <div className={_cs(styles.operationBox, className)}>
            <Header
                className={styles.header}
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
                <div className={styles.lastUpdated}>
                    <div className={styles.label}>
                        {strings.operationLastUpdated}
                    </div>
                    <DateOutput
                        value={updated_at}
                    />
                </div>
            </Header>
        </div>
    );
}

export default OperationInfoCard;
