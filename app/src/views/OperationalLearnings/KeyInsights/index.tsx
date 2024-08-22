import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import Link from '#components/Link';
import { type GoApiResponse } from '#utils/restRequest';

import Sources from '../Sources';

import i18n from './i18n.json';

type OpsLearningSummaryResponse = GoApiResponse<'/api/v2/ops-learning/summary/'>;

interface Props {
    opsLearningSummaryResponse: OpsLearningSummaryResponse;
}

function KeyInsights(props: Props) {
    const {
        opsLearningSummaryResponse,
    } = props;

    const strings = useTranslation(i18n);

    const [
        isExpanded,
        {
            toggle: toggleExpansion,
        },
    ] = useBooleanState(false);

    return (
        <Container
            heading={strings.opsLearningsSummariesHeading}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            footerIcons={resolveToString(strings.keyInsightsDisclaimer, {
                numOfExtractsUsed: opsLearningSummaryResponse.extract_count,
                totalNumberOfExtracts: 200, // TODO get this from server when available
                appealsFromDate: 2023, // TODO get this from server when available
                appealsToDate: 2024, // TODO get this from server when available
            })}
            footerActions={(
                <>
                    <Link
                        href="/"
                        external
                    >
                        {strings.keyInsightsReportIssue}
                    </Link>
                    <Button
                        name={opsLearningSummaryResponse.id}
                        variant="tertiary"
                        onClick={toggleExpansion}
                        actions={(isExpanded
                            ? <ArrowUpSmallFillIcon />
                            : <ArrowDownSmallFillIcon />
                        )}
                    >
                        {isExpanded ? strings.closeSources : strings.seeSources}
                    </Button>
                </>
            )}
            footerContent={isExpanded && (
                <Sources
                    summaryId={opsLearningSummaryResponse.id}
                    summaryType="insight"
                />
            )}
        >
            <Container
                heading={opsLearningSummaryResponse.insights1_title}
                headerDescription={opsLearningSummaryResponse.insights1_content}
                withInternalPadding
            />
            <Container
                heading={opsLearningSummaryResponse.insights2_title}
                headerDescription={opsLearningSummaryResponse.insights2_content}
                withInternalPadding
            />
            <Container
                heading={opsLearningSummaryResponse.insights3_title}
                headerDescription={opsLearningSummaryResponse.insights3_content}
                withInternalPadding
            />
        </Container>
    );
}

export default KeyInsights;
