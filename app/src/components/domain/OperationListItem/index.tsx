import {
    Button,
    Header,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventGet = GoApiResponse<'/api/v2/event/'>;
type EventResponseItem = NonNullable<EventGet['results']>[number];

export interface Props {
    className?: string;
    eventItem: EventResponseItem;
    updateSubscribedEvents: () => void;
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
        updateSubscribedEvents,
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
