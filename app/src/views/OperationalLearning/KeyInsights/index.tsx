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
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import { type GoApiResponse } from '#utils/restRequest';

import Sources from '../Sources';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
            className={styles.keyInsights}
            heading={strings.opsLearningSummariesHeading}
            withInternalPadding
            withOverflowInContent
            footerIcons={(
                <div className={styles.footerIcons}>
                    <span>
                        {resolveToString(strings.keyInsightsDisclaimer, {
                            numOfExtractsUsed: opsLearningSummaryResponse.used_extracts_count,
                            totalNumberOfExtracts: opsLearningSummaryResponse.total_extracts_count,
                            appealsFromDate: 2023, // TODO get this from server when available
                            appealsToDate: 2024, // TODO get this from server when available

                        })}
                    </span>
                    <Link
                        className={styles.reportIssue}
                        href="/"
                        external
                    >
                        {strings.keyInsightsReportIssue}
                    </Link>
                </div>
            )}
            footerClassName={styles.footer}
            footerActions={(
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
            )}
            footerContent={isExpanded && (
                <Sources
                    summaryId={opsLearningSummaryResponse.id}
                    summaryType="insight"
                />
            )}
            childrenContainerClassName={styles.insights}
        >
            {isDefined(opsLearningSummaryResponse?.insights1_title) && (
                <Container
                    heading={opsLearningSummaryResponse.insights1_title}
                    headerDescription={opsLearningSummaryResponse.insights1_content}
                />
            )}
            {isDefined(opsLearningSummaryResponse?.insights2_title) && (
                <Container
                    heading={opsLearningSummaryResponse.insights2_title}
                    headerDescription={opsLearningSummaryResponse.insights2_content}
                />
            )}
            {isDefined(opsLearningSummaryResponse?.insights3_title) && (
                <Container
                    heading={opsLearningSummaryResponse.insights3_title}
                    headerDescription={opsLearningSummaryResponse.insights3_content}
                />
            )}
        </Container>
    );
}

export default KeyInsights;
