import {
    AppealsIcon,
    DrefIcon,
    FundingCoverageIcon,
    FundingIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    Container,
    KeyFigureCard,
    ListView,
    MoreInfo,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPercentage } from '@ifrc-go/ui/utils';

import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import AppealsTable from '#components/domain/AppealsTable';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

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

    const keyFigures = !pending && aggregatedAppealResponse && (
        <ListView
            layout="grid"
            numPreferredGridColumns={5}
        >
            <KeyFigureCard
                icon={<DrefIcon />}
                value={aggregatedAppealResponse.active_drefs}
                valueType="number"
                textSize="4xl"
                info={(
                    <MoreInfo
                        title={strings.keyFiguresDrefTitle}
                    >
                        {strings.keyFiguresDrefDescription}
                    </MoreInfo>
                )}
                label={strings.homeKeyFiguresActiveDrefs}
            />
            <KeyFigureCard
                icon={<AppealsIcon />}
                value={aggregatedAppealResponse.active_appeals}
                valueType="number"
                textSize="4xl"
                info={(
                    <MoreInfo
                        title={strings.keyFiguresActiveAppealsTitle}
                    >
                        {strings.keyFigureActiveAppealDescription}
                    </MoreInfo>
                )}
                label={strings.homeKeyFiguresActiveAppeals}
            />
            <KeyFigureCard
                icon={<FundingIcon />}
                value={aggregatedAppealResponse.amount_requested_dref_included}
                valueType="number"
                textSize="4xl"
                compact
                label={strings.homeKeyFiguresBudget}
            />
            <KeyFigureCard
                icon={<FundingCoverageIcon />}
                value={getPercentage(
                    aggregatedAppealResponse?.amount_funded_dref_included,
                    aggregatedAppealResponse?.amount_requested_dref_included,
                )}
                valueType="number"
                compact
                suffix="%"
                label={strings.homeKeyFiguresAppealsFunding}
                textSize="4xl"
            />
            <KeyFigureCard
                icon={<TargetedPopulationIcon />}
                value={aggregatedAppealResponse.target_population}
                valueType="number"
                compact
                label={strings.homeKeyFiguresTargetPop}
                textSize="4xl"
            />
        </ListView>
    );

    return (
        <Page
            title={strings.homeTitle}
            heading={strings.homeHeading}
            description={strings.homeDescription}
            info={(
                <Container pending={pending}>
                    {keyFigures}
                </Container>
            )}
        >
            <HighlightedOperations variant="global" />
            <ActiveOperationMap
                variant="global"
                bbox={undefined}
                presentationModeAdditionalBeforeContent={keyFigures}
                mapTitle={strings.fullScreenHeading}
            />
            <AppealsTable variant="global" />
            <AppealsOverYearsChart />
        </Page>
    );
}

Component.displayName = 'Home';
