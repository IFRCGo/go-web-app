import { useContext } from 'react';
import {
    Button,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DomainContext from '#contexts/domain';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type EventGet = GoApiResponse<'/api/v2/event/'>;
type EventResponseItem = NonNullable<EventGet['results']>[number];

export interface Props {
    className?: string;
    eventItem: EventResponseItem;
    updateSubscribedEvents: () => void;
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
    } = props;

    const strings = useTranslation(i18n);
    const { invalidate } = useContext(DomainContext);

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
            updateSubscribedEvents();
            invalidate('user-me');
        },
    });

    const subscriptionPending = removeSubscriptionPending;

    return (
        <Container
            className={className}
            // FIXME: Let's add a link
            heading={name}
            headingLevel={5}
            headerActions={(
                <Button
                    name={id}
                    disabled={subscriptionPending}
                    onClick={triggerRemoveSubscription}
                    spacing="sm"
                >
                    {strings.operationUnfollowButtonLabel}
                </Button>
            )}
            withPadding
            withDarkBackground
        >
            <TextOutput
                label={strings.operationLastUpdatedLabel}
                value={updated_at}
                valueType="date"
            />
        </Container>
    );
}

export default OperationInfoCard;
