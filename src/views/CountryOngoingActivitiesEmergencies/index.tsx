import { useOutletContext } from 'react-router-dom';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import getBbox from '@turf/bbox';

import BlockLoading from '#components/BlockLoading';
import InfoPopup from '#components/InfoPopup';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsTable from '#components/domain/AppealsTable';
import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';
import { getPercentage } from '#utils/common';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';
import EmergencyAlertsTable from './EmergencyAlerts';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        countryId,
        countryResponse,
    } = useOutletContext<CountryOutletContext>();

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/appeal/aggregated',
        query: { country: Number(countryId) },
    });

    const bbox = isDefined(countryResponse) ? getBbox(countryResponse.bbox) : undefined;

    return (
        <div
            className={styles.countryOngoingActivitiesEmergencies}
        >
            {aggregatedAppealPending && <BlockLoading />}
            <div>
                {strings.countryOngoingActivitiesEmergenciesDescription}
            </div>
            {!aggregatedAppealPending && aggregatedAppealResponse && (
                <div className={styles.keyFigureList}>
                    <KeyFigure
                        icon={<DrefIcon />}
                        className={styles.keyFigure}
                        value={aggregatedAppealResponse.active_drefs}
                        info={(
                            <InfoPopup
                                title={strings.countryOngoingActivitiesKeyFiguresDrefTitle}
                                description={strings.countryOngoingActivitiesKeyFiguresDref}
                            />
                        )}
                        label={strings.countryOngoingActivitiesDREFOperations}
                    />
                    <KeyFigure
                        icon={<AppealsIcon />}
                        className={styles.keyFigure}
                        value={aggregatedAppealResponse.active_appeals}
                        info={(
                            <InfoPopup
                                title={strings.countryOngoingActivitiesKeyFiguresAppealsTitle}
                                description={
                                    strings.countryOngoingActivitiesFigureAppealDescription
                                }
                            />
                        )}
                        label={strings.countryOngoingActivitiesKeyFiguresActiveAppeals}
                    />
                    <KeyFigure
                        icon={<TargetedPopulationIcon />}
                        className={styles.keyFigure}
                        value={aggregatedAppealResponse.target_population}
                        compactValue
                        label={strings.countryOngoingActivitiesKeyFiguresTargetPop}
                    />
                    <KeyFigure
                        icon={<FundingIcon />}
                        className={styles.keyFigure}
                        value={aggregatedAppealResponse?.amount_requested_dref_included}
                        compactValue
                        label={strings.countryOngoingActivitiesKeyFiguresBudget}
                    />
                    <KeyFigure
                        icon={<FundingCoverageIcon />}
                        className={styles.keyFigure}
                        value={getPercentage(
                            aggregatedAppealResponse?.amount_funded,
                            aggregatedAppealResponse?.amount_requested,
                        )}
                        suffix="%"
                        compactValue
                        label={strings.countryOngoingActivitiesKeyFiguresAppealsFunding}
                    />
                </div>
            )}
            {isDefined(countryId) && (
                <HighlightedOperations
                    variant="country"
                    countryId={Number(countryId)}
                />
            )}
            {isDefined(countryId) && (
                <ActiveOperationMap
                    variant="country"
                    countryId={Number(countryId)}
                    bbox={bbox}
                />
            )}
            {isDefined(countryId) && (
                <AppealsTable
                    variant="country"
                    countryId={Number(countryId)}
                />
            )}
            {isDefined(countryId) && (
                <EmergencyAlertsTable
                    countryId={Number(countryId)}
                />
            )}
        </div>
    );
}
