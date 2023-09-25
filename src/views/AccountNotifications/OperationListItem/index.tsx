import Header from '#components/Header';
import Button from '#components/Button';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse, useLazyRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventGet = GoApiResponse<'/api/v2/event/'>;
type EventResponseItem = NonNullable<EventGet['results']>[number];

export interface Props {
    className?: string;
    eventItem: EventResponseItem;
    updateSubscibedEvents: () => void;
    isLastItem: boolean;
}

function OperationInfoCard(props: Props) {
    const {
        className,
        eventItem: {
            id,
            name,
            updated_at,
        },
        updateSubscibedEvents: updateSubscribedEvents,
        isLastItem,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: removeSubscriptionPending,
        trigger: triggerRemoveSubscription,
    } = useLazyRequest({
        method: 'POST',
        body: (eventId: number) => ([{
            value: eventId,
        }]),
        url: '/api/v2/del_subscription/',
        onSuccess: updateSubscribedEvents,
    });

    const subscriptionPending = removeSubscriptionPending;

    return (
        <>
            <Header
                className={className}
                // FIXME: Let's add a link
                heading={name}
                headingLevel={5}
                ellipsizeHeading
                spacing="none"
                actions={(
                    <Button
                        name={id}
                        variant="secondary"
                        disabled={subscriptionPending}
                        onClick={triggerRemoveSubscription}
                    >
                        {strings.operationUnfollowButtonLabel}
                    </Button>
                )}
            >
                <TextOutput
                    label={strings.operationLastUpdatedLabel}
                    value={updated_at}
                    valueType="date"
                />
            </Header>
            {!isLastItem && (
                <div className={styles.separator} />
            )}
        </>
    );
}

export default OperationInfoCard;
