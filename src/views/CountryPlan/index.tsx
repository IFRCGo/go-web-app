import { useOutletContext, useParams } from 'react-router-dom';
import { DownloadLineIcon } from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import { paths } from '#generated/types';

import { CountryOutletContext } from '#utils/country';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import BlockLoading from '#components/BlockLoading';
import Message from '#components/Message';
import Container from '#components/Container';
import { resolveToString } from '#utils/translation';

import StrategicPrioritiesTable from './StrategicPrioritiesTable';
import MembershipCoordinationTable from './MembershipCoordinationTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountryPlan = paths['/api/v2/country-plan/{country}/']['get'];
type GetCountryPlanResponse = GetCountryPlan['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const { countryId } = useParams<{ countryId: string }>();
    const strings = useTranslation(i18n);

    const {
        pending: countryPlanPending,
        response: countryPlanResponse,
    } = useRequest<GetCountryPlanResponse>({
        skip: isNotDefined(countryId) || !countryResponse?.has_country_plan,
        url: '/api/v2/country-plan/{country}/',
        pathVariables: {
            country: countryId,
        },
    });

    return (
        <Container
            className={styles.countryPlan}
            heading={resolveToString(
                strings.countryPlanTitle,
                { countryName: countryResponse?.name ?? '-' },
            )}
            headingLevel={2}
            childrenContainerClassName={styles.content}
            actionsContainerClassName={styles.actions}
            withHeaderBorder
            actions={(
                <>
                    <Link
                        variant="secondary"
                        to={countryPlanResponse?.public_plan_file ?? undefined}
                        className={styles.downloadLink}
                        icons={<DownloadLineIcon className={styles.icon} />}
                    >
                        {resolveToString(
                            strings.countryPlanDownloadPlan,
                            { countryName: countryResponse?.name },
                        )}
                    </Link>
                    <Link
                        variant="secondary"
                        to={countryPlanResponse?.internal_plan_file}
                        className={styles.downloadLink}
                        icons={<DownloadLineIcon className={styles.icon} />}
                    >
                        {resolveToString(
                            strings.countryPlanDownloadPlanInternal,
                            { countryName: countryResponse?.name },
                        )}
                    </Link>
                </>
            )}
        >
            {!countryResponse?.has_country_plan && (
                <Message
                    message={strings.countryPlanNoCountryPlan}
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
                            description={strings.countryPlanKeyFigureRequestedAmount}
                        />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={countryPlanResponse.people_targeted}
                            description={strings.countryPlanPeopleTargeted}
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
