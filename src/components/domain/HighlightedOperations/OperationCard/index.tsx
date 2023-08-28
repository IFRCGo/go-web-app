import { useContext } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import { FocusLineIcon } from '@ifrc-go/icons';

import DomainContext from '#contexts/domain';
import Container from '#components/Container';
import Button from '#components/Button';
import NumberOutput from '#components/NumberOutput';
import KeyFigure from '#components/KeyFigure';
import Tooltip from '#components/Tooltip';
import TextOutput from '#components/TextOutput';
import SeverityIndicator from '#components/domain/SeverityIndicator';
import { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import { useLazyRequest } from '#utils/restRequest';
import { sumSafe } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetEvent = paths['/api/v2/event/']['get'];
type EventResponse = GetEvent['responses']['200']['content']['application/json'];
type EventListItem = NonNullable<EventResponse['results']>[number];

interface Props {
    className?: string;
    data: EventListItem;
    subscriptionMap: Record<number, boolean>,
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
        subscriptionMap,
    } = props;

    const { invalidate } = useContext(DomainContext);

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
    const amountRequested = sumSafe(appeals.map((appeal) => +(appeal.amount_requested ?? 0)));
    const amountFunded = sumSafe(appeals.map((appeal) => +(appeal.amount_funded ?? 0)));

    // FIXME: let's use progress utility
    const coverage = isDefined(amountRequested)
        ? ((100 * (amountFunded ?? 0)) / amountRequested)
        : undefined;

    const fundingCoverageDescription = resolveToComponent(
        strings.operationCardFundingCoverage,
        { coverage: <NumberOutput value={coverage} /> },
    );

    const isSubscribed = subscriptionMap[id] ?? false;
    let countriesInfoDisplay = strings.operationCardNoCountryInvolved;

    if (countries.length > 0) {
        if (countries.length === 1) {
            countriesInfoDisplay = countries[0].name ?? '';
        } else {
            countriesInfoDisplay = strings.operationCardInvolvesMultipleCountries;
        }
    }

    return (
        <Container
            className={_cs(styles.operationCard, className)}
            heading={name}
            headingLevel={4}
            ellipsizeHeading
            withInternalPadding
            withHeaderBorder
            spacing="comfortable"
            withoutWrapInHeading
            icons={ifrc_severity_level ? (
                <>
                    <Tooltip className={styles.tooltip}>
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
                    </Tooltip>
                    <SeverityIndicator
                        className={styles.severityIndicator}
                        level={ifrc_severity_level}
                    />
                </>
            ) : undefined}
            actions={(
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
