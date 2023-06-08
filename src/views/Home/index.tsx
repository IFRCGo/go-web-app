import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';

import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import HighlightedOperations from './HighlightedOperations';
import ActiveOperationMap from './ActiveOperationMap';
import AppealsTable from './AppealsTable';
import Charts from './Charts';
import i18n from './i18n.json';

import styles from './styles.module.css';

interface AggregatedAppealResponse {
    active_appeals: number | null;
    active_drefs: number | null;
    amount_funded: number | null;
    amount_requested: number | null;
    amount_requested_dref_included: number | null;
    target_population: number | null;
    total_appeals: number | null;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest<AggregatedAppealResponse>({
        url: 'api/v2/appeal/aggregated/',
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
                                description={strings.homeKeyFiguresActiveDrefs}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
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
                                value={aggregatedAppealResponse.amount_funded}
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
            <HighlightedOperations />
            <ActiveOperationMap />
            <AppealsTable />
            <Charts />
        </Page>
    );
}

Component.displayName = 'Home';
