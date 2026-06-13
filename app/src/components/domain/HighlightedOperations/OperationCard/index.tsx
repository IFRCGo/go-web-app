import { useContext } from 'react';
import { FocusLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ButtonLayout,
    Container,
    DataDisplay,
    DateDisplay,
    DisplayLabel,
    KeyFigure,
    ListView,
    NumberDisplay,
    ProgressBar,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import SeverityIndicator from '#components/domain/SeverityIndicator';
import Link from '#components/Link';
import DomainContext from '#contexts/domain';
import useAuth from '#hooks/domain/useAuth';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

// FIXME: move this to utils
function getPercent(value: number | undefined, total: number | undefined) {
    if (isNotDefined(value) || isNotDefined(total)) {
        return undefined;
    }
    return (value / total) * 100;
}

interface Props {
    className?: string;
    data: EventListItem;
    isSubscribed: boolean;
}

function OperationCard(props: Props) {
    const {
        className,
        data: {
            id,
            name,
            ifrc_severity_level,
            ifrc_severity_level_update_date,
            ifrc_severity_level_display,
            updated_at,
            appeals,
            countries = [],
        },
        isSubscribed = false,
    } = props;

    const { invalidate } = useContext(DomainContext);
    const { isAuthenticated } = useAuth();

    const {
        pending: addSubscriptionPending,
        trigger: triggerAddSubscription,
    } = useLazyRequest({
        url: '/api/v2/add_subscription/',
        method: 'POST',
        body: (eventId: number) => ([{
            type: 'followedEvent',
            value: eventId,
        }]),
        onSuccess: () => {
            invalidate('user-me');
        },
    });

    const {
        pending: removeSubscriptionPending,
        trigger: triggerRemoveSubscription,
    } = useLazyRequest({
        url: '/api/v2/del_subscription/',
        method: 'POST',
        body: (eventId: number) => ([{
            value: eventId,
        }]),
        onSuccess: () => {
            invalidate('user-me');
        },
    });

    const subscriptionPending = addSubscriptionPending || removeSubscriptionPending;

    const strings = useTranslation(i18n);
    const targetedPopulation = sumSafe(appeals.map((appeal) => appeal.num_beneficiaries));
    const amountRequested = sumSafe(appeals.map((appeal) => appeal.amount_requested));
    const amountFunded = sumSafe(appeals.map((appeal) => appeal.amount_funded));

    const appealTypes = appeals.map((appeal) => appeal.atype_display);

    const coverage = getPercent(amountFunded, amountRequested);

    let countriesInfoDisplay = strings.operationCardNoCountryInvolved;
    if (countries.length === 1) {
        countriesInfoDisplay = countries[0]!.name ?? '?';
    } else if (countries.length > 1) {
        countriesInfoDisplay = strings.operationCardInvolvesMultipleCountries;
    }

    return (
        <Container
            className={className}
            withPadding
            backgroundColor="foreground"
            boxShadow="md"
            pending={false}
            empty={false}
            filtered={false}
            errored={false}
            heading={(
                <Link
                    to="emergenciesLayout"
                    urlParams={{ emergencyId: id }}
                    withEllipsizedContent
                    withoutPadding
                >
                    {name}
                </Link>
            )}
            headingLevel={6}
            withHeaderBorder
            headerIcons={ifrc_severity_level ? (
                <>
                    <Tooltip
                        description={(
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                            >
                                <ListView spacing="xs">
                                    <SeverityIndicator level={ifrc_severity_level} />
                                    {ifrc_severity_level_display}
                                    <DateDisplay value={ifrc_severity_level_update_date} />
                                </ListView>
                                <DataDisplay
                                    label={<FocusLineIcon />}
                                    value={countriesInfoDisplay}
                                    withoutLabelColon
                                />
                            </ListView>
                        )}
                    />
                    <SeverityIndicator
                        level={ifrc_severity_level}
                    />
                </>
            ) : undefined}
            headerActions={isAuthenticated && (
                <Button
                    name={id}
                    disabled={subscriptionPending}
                    onClick={isSubscribed
                        ? triggerRemoveSubscription
                        : triggerAddSubscription}
                    spacing="sm"
                >
                    {isSubscribed
                        ? strings.operationCardUnfollow
                        : strings.operationCardFollow}
                </Button>
            )}
            headerDescription={(
                <ListView
                    spacing="sm"
                    withSpaceBetweenContents
                >
                    {isDefined(appealTypes) && appealTypes.length > 0 ? (
                        <ButtonLayout
                            // FIXME: we should use Tag component here
                            textSize="sm"
                            spacing="3xs"
                            withEllipsizedContent
                            readOnly
                        >
                            {appealTypes.join(', ')}
                        </ButtonLayout>
                    ) : <div />}
                    <DataDisplay
                        label={strings.operationCardLastUpdated}
                        value={updated_at}
                        valueType="date"
                        withUppercaseLetters
                        withLightText
                        textSize="sm"
                    />
                </ListView>
            )}
            footer={(
                <ProgressBar
                    value={coverage}
                    totalValue={100}
                    title={(
                        <ListView
                            spacing="xs"
                            withSpaceBetweenContents
                        >
                            <DisplayLabel withUppercaseLetters>
                                {strings.operationCardFundingCoverage}
                            </DisplayLabel>
                            <NumberDisplay
                                value={coverage}
                                suffix="%"
                            />
                        </ListView>
                    )}
                />
            )}
            withFooterBorder
        >
            <ListView
                layout="grid"
                minGridColumnSize="6rem"
            >
                <KeyFigure
                    label={(
                        <Link
                            to="emergenciesLayout"
                            urlParams={{ emergencyId: id }}
                            colorVariant="text"
                        >
                            {strings.operationCardTargetedPopulation}
                        </Link>
                    )}
                    value={targetedPopulation}
                    valueType="number"
                    compact
                />
                <KeyFigure
                    value={amountRequested}
                    label={(
                        <Link
                            to="emergencyReportsAndDocuments"
                            urlParams={{ emergencyId: id }}
                            colorVariant="text"
                        >
                            {strings.operationCardFunding}
                        </Link>
                    )}
                    valueType="number"
                    compact
                />
            </ListView>
        </Container>
    );
}

export default OperationCard;
