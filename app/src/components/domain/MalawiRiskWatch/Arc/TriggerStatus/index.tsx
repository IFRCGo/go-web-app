import {
    AlertLineIcon,
    CheckLineIcon,
} from '@ifrc-go/icons';
import {
    Container,
    InfoPopup,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import { ARC_TRIGGER_RP_THRESHOLD } from '../../constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface TriggerEvent {
    status: string;
    reviewNotes?: string | null;
}

interface Props {
    returnPeriod: number | undefined;
    triggerEvent: TriggerEvent | undefined;
}

function TriggerStatus(props: Props) {
    const {
        returnPeriod,
        triggerEvent,
    } = props;

    const strings = useTranslation(i18n);

    const exceeded = isDefined(returnPeriod) && returnPeriod > ARC_TRIGGER_RP_THRESHOLD;
    // Notification states still mean MRCS confirmed the trigger
    const reviewLabels: Record<string, string> = {
        pending_review: strings.arcTriggerReviewPending,
        confirmed: strings.arcTriggerReviewConfirmed,
        sent: strings.arcTriggerReviewSent,
        send_failed: strings.arcTriggerReviewSendFailed,
        rejected: strings.arcTriggerReviewRejected,
    };
    const StatusIcon = exceeded ? AlertLineIcon : CheckLineIcon;

    return (
        <Container
            className={styles.triggerStatus}
            heading={exceeded ? strings.arcTriggerExceeded : strings.arcTriggerNotExceeded}
            headingLevel={6}
            headerIcons={(
                <StatusIcon className={_cs(styles.statusIcon, exceeded && styles.exceeded)} />
            )}
            headerActions={(
                <>
                    <span className={styles.returnPeriod}>
                        {isDefined(returnPeriod)
                            ? resolveToString(
                                strings.arcTriggerReturnPeriod,
                                { years: returnPeriod },
                            )
                            : strings.arcTriggerNoReturnPeriod}
                    </span>
                    <InfoPopup
                        title={strings.arcTriggerInfoTitle}
                        description={resolveToString(
                            strings.arcTriggerInfo,
                            { threshold: ARC_TRIGGER_RP_THRESHOLD },
                        )}
                    />
                </>
            )}
            spacing="sm"
            withBorder
            withPadding
        >
            <TextOutput
                label={strings.arcTriggerReviewLabel}
                value={isDefined(triggerEvent)
                    ? (reviewLabels[triggerEvent.status] ?? triggerEvent.status)
                    : strings.arcTriggerReviewNone}
                description={isTruthyString(triggerEvent?.reviewNotes) && triggerEvent.reviewNotes}
                strongValue
            />
        </Container>
    );
}

export default TriggerStatus;
