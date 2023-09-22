import { useOutletContext, useParams } from 'react-router-dom';
import { DownloadLineIcon } from '@ifrc-go/icons';
import { isDefined, isNotDefined, isTruthyString } from '@togglecorp/fujs';

import { type CountryOutletContext } from '#utils/outletContext';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import BlockLoading from '#components/BlockLoading';
import Message from '#components/Message';
import Container from '#components/Container';
import { resolveToString } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';

import StrategicPrioritiesTable from './StrategicPrioritiesTable';
import MembershipCoordinationTable from './MembershipCoordinationTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const { countryId } = useParams<{ countryId: string }>();
    const strings = useTranslation(i18n);

    const {
        pending: countryPlanPending,
        response: countryPlanResponse,
    } = useRequest({
        // FIXME: need to check if countryId can be ''
        skip: isNotDefined(countryId) || !countryResponse?.has_country_plan,
        url: '/api/v2/country-plan/{country}/',
        pathVariables: {
            country: Number(countryId),
        },
    });

    return (
        <Container
            className={styles.countryPlan}
            heading={resolveToString(
                strings.countryPlanTitle,
                { countryName: countryResponse?.name ?? '--' },
            )}
            headingLevel={2}
            childrenContainerClassName={styles.content}
            actionsContainerClassName={styles.actions}
            withHeaderBorder
            actions={isDefined(countryPlanResponse) && (
                <>
                    {isDefined(countryPlanResponse.public_plan_file) && (
                        <Link
                            variant="secondary"
                            href={countryPlanResponse.public_plan_file}
                            external
                            className={styles.downloadLink}
                            icons={<DownloadLineIcon className={styles.icon} />}
                        >
                            {resolveToString(
                                strings.countryPlanDownloadPlan,
                                { countryName: countryResponse?.name ?? '--' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryPlanResponse.internal_plan_file) && (
                        <Link
                            variant="secondary"
                            href={countryPlanResponse.internal_plan_file}
                            external
                            className={styles.downloadLink}
                            icons={<DownloadLineIcon className={styles.icon} />}
                        >
                            {resolveToString(
                                strings.countryPlanDownloadPlanInternal,
                                { countryName: countryResponse?.name ?? '--' },
                            )}
                        </Link>
                    )}
                </>
            )}
        >
            {!countryResponse?.has_country_plan && (
                <Message
                    title={strings.countryPlanNoCountryPlan}
                />
            )}
            {countryPlanPending && (
                <BlockLoading />
            )}
            {countryResponse?.has_country_plan && !countryPlanPending && !countryPlanResponse && (
                <div className={styles.errored}>
                    {strings.countryPlanLoadFailureMessage}
                </div>
            )}
            {countryResponse?.has_country_plan && !countryPlanPending && countryPlanResponse && (
                <>
                    <div className={styles.keyFigures}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={countryPlanResponse.requested_amount}
                            label={strings.countryPlanKeyFigureRequestedAmount}
                            compactValue
                        />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={countryPlanResponse.people_targeted}
                            label={strings.countryPlanPeopleTargeted}
                            compactValue
                        />
                    </div>
                    <div className={styles.tablesSection}>
                        <StrategicPrioritiesTable
                            className={styles.strategicPriorityTable}
                            priorityData={countryPlanResponse.strategic_priorities}
                        />
                        <MembershipCoordinationTable
                            className={styles.membershipCoordinationTable}
                            membershipData={countryPlanResponse.membership_coordinations}
                        />
                    </div>
                </>
            )}
        </Container>
    );
}

Component.displayName = 'CountryPlan';
