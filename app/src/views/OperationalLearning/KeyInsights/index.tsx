import { AlertLineIcon } from '@ifrc-go/icons';
import {
    Container,
    Description,
    ExpandableContainer,
    ListView,
    NumberOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

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

    return (
        <Container
            heading={strings.opsLearningSummariesHeading}
            withPadding
            backgroundColor="background"
            headingLevel={5}
            spacing="lg"
        >
            <ListView
                layout="block"
                spacing="lg"
            >
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                    spacing="lg"
                >
                    {isDefined(opsLearningSummaryResponse?.insights1_title) && (
                        <Container
                            heading={opsLearningSummaryResponse.insights1_title}
                            headingLevel={6}
                        >
                            {opsLearningSummaryResponse.insights1_content}
                        </Container>
                    )}
                    {isDefined(opsLearningSummaryResponse?.insights2_title) && (
                        <Container
                            heading={opsLearningSummaryResponse.insights2_title}
                            headingLevel={6}
                        >
                            {opsLearningSummaryResponse.insights2_content}
                        </Container>
                    )}
                    {isDefined(opsLearningSummaryResponse?.insights3_title) && (
                        <Container
                            heading={opsLearningSummaryResponse.insights3_title}
                            headingLevel={6}
                        >
                            {opsLearningSummaryResponse.insights3_content}
                        </Container>
                    )}
                </ListView>
                <Description withLightText>
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
                                withLinkIcon
                            >
                                {strings.methodologyLinkLabel}
                            </Link>
                        ),
                    })}
                </Description>
                <ExpandableContainer
                    headerIcons={(
                        <Link
                            href="https://forms.office.com/pages/responsepage.aspx?id=5Tu1ok5zbE6rDdGE9g_ZF4KwLxGrbflAt2rbQ7DtFG5UQU1CTEZTSldLQ0ZTVEtPSVdQQklOVzBDVi4u"
                            before={<AlertLineIcon />}
                            external
                            withLinkIcon
                            colorVariant="primary"
                        >
                            {strings.keyInsightsReportIssue}
                        </Link>
                    )}
                    withToggleButtonOnFooter
                    toggleButtonLabel={[
                        strings.keyInsightsSeeSources,
                        strings.keyInsightsCloseSources,
                    ]}
                >
                    <Sources
                        summaryId={opsLearningSummaryResponse.id}
                        summaryType="insight"
                    />
                </ExpandableContainer>
            </ListView>
        </Container>
    );
}

export default KeyInsights;
