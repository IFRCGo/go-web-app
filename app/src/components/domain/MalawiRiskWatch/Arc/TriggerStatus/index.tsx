import {
    Container,
    InfoPopup,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';

import {
    ARC_CONFIRMED_STATUSES,
    ARC_TRIGGER_RP_THRESHOLD,
} from '../../constants';
import Tag from '../../Tag';
import { getMalawiAdminUrl } from '../../utils';

import i18n from './i18n.json';

interface TriggerEvent {
    id: string;
    status: string;
    reviewNotes?: string | null;
}

interface Props {
    returnPeriod: number | undefined;
    triggeredCount: number;
    districtCount: number;
    triggerEvent: TriggerEvent | undefined;
}

function TriggerStatus(props: Props) {
    const {
        returnPeriod,
        triggeredCount,
        districtCount,
        triggerEvent,
    } = props;

    const strings = useTranslation(i18n);

    const exceeded = isDefined(returnPeriod) && returnPeriod > ARC_TRIGGER_RP_THRESHOLD;

    let reviewLabel = strings.arcTriggerReviewNone;
    let reviewColor: 'primary' | 'success' | 'text' = 'text';
    if (isDefined(triggerEvent)) {
        if (ARC_CONFIRMED_STATUSES.includes(triggerEvent.status)) {
            reviewLabel = strings.arcTriggerReviewConfirmed;
            reviewColor = 'success';
        } else if (triggerEvent.status === 'rejected') {
            reviewLabel = strings.arcTriggerReviewRejected;
            reviewColor = 'primary';
        } else {
            reviewLabel = strings.arcTriggerReviewPending;
        }
    }

    return (
        <Container
            heading={strings.arcTriggerHeading}
            headingLevel={6}
            headerActions={(
                <>
                    <InfoPopup
                        title={strings.arcTriggerInfoTitle}
                        description={resolveToString(
                            strings.arcTriggerInfo,
                            { threshold: ARC_TRIGGER_RP_THRESHOLD },
                        )}
                    />
                    {isDefined(triggerEvent) && (
                        <Link
                            href={getMalawiAdminUrl(
                                `pipeline/arctriggerevent/${triggerEvent.id}/review/`,
                            )}
                            external
                            styleVariant="outline"
                            withLinkIcon
                        >
                            {strings.arcTriggerReviewLink}
                        </Link>
                    )}
                </>
            )}
            spacing="sm"
            withBorder
            withPadding
        >
            <ListView
                layout="block"
                spacing="2xs"
            >
                <ListView
                    spacing="md"
                    withWrap
                >
                    <TextOutput
                        label={strings.arcTriggerReturnPeriodLabel}
                        value={(
                            <ListView spacing="xs">
                                {isDefined(returnPeriod)
                                    ? resolveToString(
                                        strings.arcTriggerReturnPeriodValue,
                                        { years: returnPeriod },
                                    )
                                    : strings.arcTriggerReviewNone}
                                <Tag
                                    label={exceeded
                                        ? strings.arcTriggerExceeded
                                        : strings.arcTriggerNotExceeded}
                                    colorVariant={exceeded ? 'primary' : 'text'}
                                />
                            </ListView>
                        )}
                        strongValue
                    />
                    <TextOutput
                        label={strings.arcTriggerDistrictsLabel}
                        value={resolveToString(
                            strings.arcTriggerDistrictsValue,
                            { count: triggeredCount, total: districtCount },
                        )}
                        strongValue
                    />
                </ListView>
                <TextOutput
                    label={strings.arcTriggerReviewLabel}
                    value={(
                        <Tag
                            label={reviewLabel}
                            colorVariant={reviewColor}
                        />
                    )}
                />
                {isTruthyString(triggerEvent?.reviewNotes) && (
                    <TextOutput
                        label={strings.arcTriggerNotesLabel}
                        value={triggerEvent.reviewNotes}
                    />
                )}
            </ListView>
        </Container>
    );
}

export default TriggerStatus;
