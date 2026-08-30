import {
    AppealsIcon,
    DrefIcon,
    FundingCoverageIcon,
    FundingIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    Container,
    InfoPopup,
    KeyFigureView,
    ListView,
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
            <KeyFigureView
                icon={<DrefIcon />}
                value={aggregatedAppealResponse.active_drefs}
                valueType="number"
                size="lg"
                info={(
                    <InfoPopup
                        title={strings.keyFiguresDrefTitle}
                        description={strings.keyFiguresDrefDescription}
                    />
                )}
                label={strings.homeKeyFiguresActiveDrefs}
            />
            <KeyFigureView
                icon={<AppealsIcon />}
                value={aggregatedAppealResponse.active_appeals}
                valueType="number"
                size="lg"
                info={(
                    <InfoPopup
                        title={strings.keyFiguresActiveAppealsTitle}
                        description={strings.keyFigureActiveAppealDescription}
                    />
                )}
                label={strings.homeKeyFiguresActiveAppeals}
            />
            <KeyFigureView
                icon={<FundingIcon />}
                value={aggregatedAppealResponse.amount_requested_dref_included}
                valueType="number"
                size="lg"
                valueOptions={{ compact: true }}
                label={strings.homeKeyFiguresBudget}
            />
            <KeyFigureView
                icon={<FundingCoverageIcon />}
                value={getPercentage(
                    aggregatedAppealResponse?.amount_funded_dref_included,
                    aggregatedAppealResponse?.amount_requested_dref_included,
                )}
                valueType="number"
                valueOptions={{
                    compact: true,
                    suffix: '%',
                }}
                label={strings.homeKeyFiguresAppealsFunding}
                size="lg"
            />
            <KeyFigureView
                icon={<TargetedPopulationIcon />}
                value={aggregatedAppealResponse.target_population}
                valueType="number"
                valueOptions={{ compact: true }}
                label={strings.homeKeyFiguresTargetPop}
                size="lg"
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
