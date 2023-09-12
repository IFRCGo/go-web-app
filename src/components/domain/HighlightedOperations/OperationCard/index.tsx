import { useContext } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { FocusLineIcon } from '@ifrc-go/icons';

import DomainContext from '#contexts/domain';
import Container from '#components/Container';
import Button from '#components/Button';
import NumberOutput from '#components/NumberOutput';
import KeyFigure from '#components/KeyFigure';
import Tooltip from '#components/Tooltip';
import TextOutput from '#components/TextOutput';
import SeverityIndicator from '#components/domain/SeverityIndicator';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import useAuth from '#hooks/domain/useAuth';
import { resolveToComponent } from '#utils/translation';
import { useLazyRequest } from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
            ifrc_severity_level_display,
            updated_at,
            appeals,
            countries = [],
        },
        isSubscribed = false,
    } = props;

    const { invalidate } = useContext(DomainContext);
    const isAuthenticated = useAuth();

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

    const coverage = getPercent(amountFunded, amountRequested);

    const fundingCoverageDescription = resolveToComponent(
        strings.operationCardFundingCoverage,
        { coverage: <NumberOutput value={coverage} /> },
    );

    let countriesInfoDisplay = strings.operationCardNoCountryInvolved;
    if (countries.length === 1) {
        countriesInfoDisplay = countries[0].name ?? '?';
    } else if (countries.length > 1) {
        countriesInfoDisplay = strings.operationCardInvolvesMultipleCountries;
    }

    return (
        <Container
            className={_cs(styles.operationCard, className)}
            // heading={name}
            heading={(
                <Link
                    to="emergenciesLayout"
                    urlParams={{ emergencyId: id }}
                    ellipsize
                >
                    {name}
                </Link>
            )}
            headingLevel={4}
            withInternalPadding
            withHeaderBorder
            withoutWrapInHeading
            icons={ifrc_severity_level ? (
                <>
                    <Tooltip
                        description={(
                            <>
                                <TextOutput
                                    label={(
                                        <SeverityIndicator
                                            level={ifrc_severity_level}
                                        />
                                    )}
                                    value={ifrc_severity_level_display}
                                    withoutLabelColon
                                />
                                <TextOutput
                                    label={<FocusLineIcon />}
                                    value={countriesInfoDisplay}
                                    withoutLabelColon
                                />
                            </>
                        )}
                    />
                    <SeverityIndicator
                        className={styles.severityIndicator}
                        level={ifrc_severity_level}
                    />
                </>
            ) : undefined}
            actions={isAuthenticated && (
                <Button
                    name={id}
                    variant="secondary"
                    disabled={subscriptionPending}
                    onClick={isSubscribed ? triggerRemoveSubscription : triggerAddSubscription}
                >
                    {isSubscribed ? strings.operationCardUnfollow : strings.operationCardFollow}
                </Button>
            )}
            headerDescription={(
                <TextOutput
                    className={styles.lastUpdated}
                    label={strings.operationCardLastUpdated}
                    value={updated_at}
                    valueType="date"
                />
            )}
            childrenContainerClassName={styles.figures}
        >
            <KeyFigure
                className={styles.figure}
                value={targetedPopulation}
                description={strings.operationCardTargetedPopulation}
                compactValue
            />
            <div className={styles.separator} />
            {/* FIXME This keyFigure should route to emergencies/id/report */}
            <KeyFigure
                className={styles.figure}
                value={amountRequested}
                description={strings.operationCardFunding}
                compactValue
                progress={coverage}
                progressDescription={fundingCoverageDescription}
            />
        </Container>
    );
}

export default OperationCard;
