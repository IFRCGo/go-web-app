import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';

import { isNotDefined } from '@togglecorp/fujs';
import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import InfoPopup from '#components/InfoPopup';
import KeyFigure from '#components/KeyFigure';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsTable from '#components/domain/AppealsTable';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function getPercentage(value: number, total: number) {
    if (isNotDefined(value) || isNotDefined(total) || total === 0) {
        return 0;
    }

    return (value * 100) / total;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        url: '/api/v2/appeal/aggregated',
    });

    const pending = aggregatedAppealPending;

    return (
        <Page
            title={strings.homeTitle}
            className={styles.home}
            heading={strings.homeHeading}
            description={strings.homeDescription}
            mainSectionClassName={styles.content}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {pending && <BlockLoading />}
                    {!pending && aggregatedAppealResponse && (
                        <>
                            <KeyFigure
                                icon={<DrefIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_drefs}
                                info={(
                                    <InfoPopup
                                        // FIXME: use translation
                                        title="DREF"
                                        description={strings.keyFiguresDrefDescription}
                                    />
                                )}
                                description={strings.homeKeyFiguresActiveDrefs}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
                                info={(
                                    <InfoPopup
                                        // FIXME: use translation
                                        title="Emergency Appeal"
                                        description={strings.keyFigureActiveAppealDescription}
                                    />
                                )}
                                description={strings.homeKeyFiguresActiveAppeals}
                            />
                            <KeyFigure
                                icon={<FundingIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_requested_dref_included}
                                compactValue
                                description={strings.homeKeyFiguresBudget}
                            />
                            <KeyFigure
                                icon={<FundingCoverageIcon />}
                                className={styles.keyFigure}
                                value={getPercentage(
                                    aggregatedAppealResponse?.amount_funded,
                                    aggregatedAppealResponse?.amount_requested_dref_included,
                                )}
                                suffix="%"
                                compactValue
                                description={strings.homeKeyFiguresAppealsFunding}
                            />
                            <KeyFigure
                                icon={<TargetedPopulationIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.target_population}
                                compactValue
                                description={strings.homeKeyFiguresTargetPop}
                            />
                        </>
                    )}
                </>
            )}
        >
            <HighlightedOperations variant="global" />
            <ActiveOperationMap
                variant="global"
                bbox={undefined}
            />
            <AppealsTable variant="global" />
            <AppealsOverYearsChart />
        </Page>
    );
}

Component.displayName = 'Home';
