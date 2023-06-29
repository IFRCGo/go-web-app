import { MdDownload } from 'react-icons/md';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import type { Country } from '#types/country';
import { useRequest } from '#utils/restRequest';
import ButtonLikeLink from '#components/ButtonLikeLink';
import KeyFigure from '#components/KeyFigure';
import Header from '#components/Header';
import BlockLoading from '#components/BlockLoading';
import useTranslation from '#hooks/useTranslation';
import StrategicPrioritiesTable from './StrategicPrioritiesTable';
import MembershipCoordinationTable from './MembershipCoordinationTable';
import type { GET } from '#types/serverResponse';

import i18n from './i18n.json';
import styles from './styles.module.css';
import Message from '#components/Message';

interface Props {
    className?: string;
    countryDetails?: Country;
    hasCountryPlan?: boolean;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const {
        className,
        countryDetails,
        hasCountryPlan,
    } = props;

    const strings = useTranslation(i18n);

    type CountryPlanApiResponse = GET['api/v2/country-plan/:id'];

    const {
        pending: countryPlanPending,
        response: countryPlanResponse,
    } = useRequest<CountryPlanApiResponse>({
        // skip: isNotDefined(countryDetails?.id) || !hasCountryPlan,
        url: `api/v2/country-plan/123`,
    });

    return (
        <div className={_cs(styles.countryPlan, className)}>
            {hasCountryPlan && (
                <Message
                    message={strings.countryPlanNoCountryPlan}
                />
            )}
            {countryPlanPending && (
                <BlockLoading />
            )}
            {hasCountryPlan && !countryPlanPending && !countryPlanResponse && (
                <div className={styles.errored}>
                    {strings.countryPlanLoadFailureMessage}
                </div>
            )}
            {!countryPlanPending && countryPlanResponse && (
                <>
                    <Header
                        className={styles.header}
                        headingContainerClassName={styles.headingContainer}
                        headingLevel={1}
                        heading={strings.activeCountryPlanTitle}
                        actions={undefined}
                    />
                    {(countryPlanResponse.internal_plan_file
                        || countryPlanResponse.public_plan_file) && (
                            <div className={styles.downloadLinks}>
                                {countryPlanResponse.public_plan_file && (
                                    <ButtonLikeLink
                                        external
                                        variant="secondary"
                                        to={countryPlanResponse.public_plan_file}
                                        className={styles.downloadLink}
                                        icons={<MdDownload />}
                                    >
                                        {strings.countryPlanDownloadPlan}
                                    </ButtonLikeLink>
                                )}
                                {countryPlanResponse.internal_plan_file && (
                                    <ButtonLikeLink
                                        external
                                        variant="secondary"
                                        to={countryPlanResponse.internal_plan_file}
                                        className={styles.downloadLink}
                                        icons={<MdDownload />}
                                    >
                                        {strings.countryPlanDownloadPlanInternal}
                                    </ButtonLikeLink>
                                )}
                            </div>
                        )}
                    <div className={styles.stats}>
                        <KeyFigure
                            value={countryPlanResponse.requested_amount}
                            description={strings.countryPlanKeyFigureRequestedAmount}
                        />
                        <div className={styles.separator} />
                        <KeyFigure
                            value={countryPlanResponse.people_targeted}
                            description={strings.countryPlanPeopleTargeted}
                        />
                    </div>
                    <div className={styles.tablesSection}>
                        <StrategicPrioritiesTable
                            className={styles.strategicPriorityTable}
                            data={countryPlanResponse.strategic_priorities}
                        />
                        <MembershipCoordinationTable
                            className={styles.coordinationTable}
                            data={countryPlanResponse.membership_coordinations}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

Component.displayName = 'CountryPlan';
