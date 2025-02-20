import {
    AlertFillIcon,
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    NumberOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    formatDate,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
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
            headingLevel={2}
            heading={strings.opsLearningSummariesHeading}
            withInternalPadding
            withOverflowInContent
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            footerActionsContainerClassName={styles.actions}
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
                    {isExpanded ? strings.keyInsightsCloseSources : strings.keyInsightsSeeSources}
                </Button>
            )}
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
            <div className={styles.disclaimerText}>
                {resolveToComponent(strings.keyInsightsDisclaimer, {
                    numOfExtractsUsed: (
                        <NumberOutput
                            value={opsLearningSummaryResponse.used_extracts_count}
                        />
                    ),
                    totalNumberOfExtracts: (
                        <NumberOutput
                            value={opsLearningSummaryResponse.total_extracts_count}
                        />
                    ),
                    appealsFromDate: formatDate(
                        opsLearningSummaryResponse.earliest_appeal_date,
                        'MMM-yyyy',
                    ),
                    appealsToDate: formatDate(
                        opsLearningSummaryResponse.latest_appeal_date,
                        'MMM-yyyy',
                    ),
                    methodologyLink: (
                        <Link
                            href="https://go-wiki.ifrc.org/en/user_guide/ops_learning"
                            external
                            withUnderline
                            linkElementClassName={styles.methodologyLink}
                            withLinkIcon
                        >
                            {strings.methodologyLinkLabel}
                        </Link>
                    ),
                })}
            </div>
            <div className={styles.reportIssueLinkContainer}>
                <Link
                    linkElementClassName={styles.reportIssueLink}
                    href="https://forms.office.com/pages/responsepage.aspx?id=5Tu1ok5zbE6rDdGE9g_ZF4KwLxGrbflAt2rbQ7DtFG5UQU1CTEZTSldLQ0ZTVEtPSVdQQklOVzBDVi4u"
                    icons={<AlertFillIcon />}
                    external
                    withLinkIcon
                >
                    {strings.keyInsightsReportIssue}
                </Link>
            </div>
            {isExpanded && (
                <Sources
                    className={styles.sources}
                    summaryId={opsLearningSummaryResponse.id}
                    summaryType="insight"
                />
            )}
        </Container>
    );
}

export default KeyInsights;
