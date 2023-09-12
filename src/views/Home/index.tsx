import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    AlertInformationLineIcon,
} from '@ifrc-go/icons';

import { isNotDefined } from '@togglecorp/fujs';
import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import Tooltip from '#components/Tooltip';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsTable from '#components/domain/AppealsTable';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function percent(value: number, total: number) {
    if (isNotDefined(value) || isNotDefined(total)) {
        return 0;
    }
    return (value / total) * 100;
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
                                description={(
                                    <div className={styles.description}>
                                        {strings.homeKeyFiguresActiveDrefs}
                                        <div className={styles.descriptionIcon}>
                                            <AlertInformationLineIcon />
                                            <Tooltip
                                                description={strings.keyFiguresDrefDescription}
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
                                description={(
                                    <div className={styles.description}>
                                        {strings.homeKeyFiguresActiveAppeals}
                                        <div className={styles.descriptionIcon}>
                                            <AlertInformationLineIcon />
                                            <Tooltip
                                                description={
                                                    strings.keyFigureActiveAppealDescription
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
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
                                value={percent(
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
