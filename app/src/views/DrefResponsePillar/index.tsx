import {
    Chip,
    Description,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import DrefDecisionTreeCallout from '#components/domain/DrefDecisionTreeCallout';
import DrefDocumentLink from '#components/domain/DrefDocumentLink';
import DrefKeyResources from '#components/domain/DrefKeyResources';
import Faq from '#components/domain/Faq';
import FaqHeading from '#components/domain/Faq/FaqHeading';
import TermText from '#components/domain/Faq/TermText';
import FaqList from '#components/domain/FaqList';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { DREF_TYPE_RESPONSE } from '#utils/constants';
import {
    DREF_ADVANCE_PAYMENT_FORM_URL,
    DREF_GUIDELINES_DROUGHT_URL,
    DREF_GUIDELINES_LOAN_URL,
    DREF_GUIDELINES_READINESS_URL,
    DREF_RESPONSE_GUIDANCE_URL,
    getNewDrefRouteState,
} from '#utils/domain/dref';

import DrefOperationsMap from './DrefOperationsMap';
import DrefOperationsTable from './DrefOperationsTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

const responseDrefRouteState = getNewDrefRouteState(DREF_TYPE_RESPONSE);

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <TabPage>
            <ListView layout="grid">
                <Description>
                    {strings.responseIntro}
                </Description>
                <ListView
                    withStartAlignment
                    withWrap
                >
                    <Link
                        to="newDrefApplicationForm"
                        state={responseDrefRouteState}
                        styleVariant="filled"
                        colorVariant="primary"
                    >
                        {strings.drefApplicationFormLink}
                    </Link>
                    <DrefDocumentLink
                        name="fullResponseGuidance"
                        url={DREF_RESPONSE_GUIDANCE_URL}
                        label={strings.fullResponseGuidanceLink}
                    />
                </ListView>
            </ListView>
            <FaqList>
                <Faq
                    name="responseDref"
                    question={strings.faqResponseDrefQuestion}
                >
                    <p>{strings.faqResponseDrefParaOne}</p>
                    <p>{strings.faqResponseDrefParaTwo}</p>
                    <p>{strings.faqResponseDrefParaThree}</p>
                </Faq>
                <Faq
                    name="characteristics"
                    question={strings.faqCharacteristicsQuestion}
                >
                    <ul>
                        <li>
                            <TermText
                                term={strings.faqCharTimeframeTerm}
                                variant="bold"
                            >
                                {strings.faqCharTimeframeDetail}
                            </TermText>
                        </li>
                        <li>
                            <TermText
                                term={strings.faqCharTriggerTerm}
                                variant="bold"
                            >
                                {strings.faqCharTriggerDetail}
                            </TermText>
                        </li>
                        <li>
                            <TermText
                                term={strings.faqCharThresholdsTerm}
                                variant="bold"
                            >
                                {strings.faqCharThresholdsDetail}
                            </TermText>
                        </li>
                        <li>
                            <TermText
                                term={strings.faqCharComponentsTerm}
                                variant="bold"
                            >
                                {strings.faqCharComponentsDetail}
                            </TermText>
                            <ul>
                                <li>{strings.faqCharComponentsDirect}</li>
                                <li>{strings.faqCharComponentsAssessments}</li>
                                <li>{strings.faqCharComponentsHumanResources}</li>
                                <li>{strings.faqCharComponentsEarlyRecovery}</li>
                            </ul>
                        </li>
                        <li>
                            <TermText
                                term={strings.faqCharPlanningTerm}
                                variant="bold"
                            >
                                {strings.faqCharPlanningDetail}
                            </TermText>
                        </li>
                        <li>
                            <TermText
                                term={strings.faqCharCostTerm}
                                variant="bold"
                            >
                                {strings.faqCharCostDetail}
                            </TermText>
                        </li>
                        <li>
                            <TermText
                                term={strings.faqCharConsiderations}
                                variant="bold"
                            />
                            <ul>
                                <li>
                                    <Link
                                        external
                                        href={DREF_GUIDELINES_DROUGHT_URL}
                                        withUnderline
                                        withLinkIcon
                                    >
                                        {strings.faqCharConsiderationDroughtLink}
                                    </Link>
                                    &nbsp;
                                    {strings.faqCharConsiderationDrought}
                                </li>
                                <li>
                                    {strings.faqCharConsiderationAssessmentsTerm}
                                </li>
                                <li>
                                    <Link
                                        external
                                        href={DREF_GUIDELINES_READINESS_URL}
                                        withUnderline
                                        withLinkIcon
                                    >
                                        {strings.faqCharConsiderationReadinessLink}
                                    </Link>
                                    &nbsp;
                                    {strings.faqCharConsiderationReadiness}
                                </li>
                                <li>
                                    <Link
                                        external
                                        href={DREF_GUIDELINES_LOAN_URL}
                                        withUnderline
                                        withLinkIcon
                                    >
                                        {strings.faqCharConsiderationLoanLink}
                                    </Link>
                                    &nbsp;
                                    {strings.faqCharConsiderationLoan}
                                </li>
                            </ul>
                        </li>
                    </ul>
                </Faq>
                <Faq
                    name="responseProcess"
                    question={strings.faqResponseProcessQuestion}
                >
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                        spacing="sm"
                    >
                        <FaqHeading variant="section">
                            {strings.faqProcessPlanningHeading}
                        </FaqHeading>
                        <p>{strings.faqProcessPlanningIntro}</p>
                        <p>{strings.faqProcessPlanningSupported}</p>
                        <ul>
                            <li>{strings.faqProcessPlanningTrigger}</li>
                            <li>{strings.faqProcessPlanningCapacity}</li>
                            <li>{strings.faqProcessPlanningReview}</li>
                            <li>{strings.faqProcessPlanningGaps}</li>
                            <li>{strings.faqProcessPlanningAssessment}</li>
                            <li>{strings.faqProcessPlanningOption}</li>
                            <li>{strings.faqProcessPlanningStrategy}</li>
                            <li>{strings.faqProcessPlanningEligible}</li>
                        </ul>
                        <p>{strings.faqProcessPlanningLink}</p>
                        <p>{strings.faqProcessPlanningSubmitted}</p>
                        <ul>
                            <li>{strings.faqProcessPlanningOnline}</li>
                            <li>{strings.faqProcessPlanningOffline}</li>
                        </ul>
                        <p>{strings.faqProcessPlanningTiming}</p>
                        <p>{strings.faqProcessPlanningAdvance}</p>
                    </ListView>
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                        spacing="sm"
                    >
                        <FaqHeading variant="section">
                            {strings.faqProcessReviewHeading}
                        </FaqHeading>
                        <p>{strings.faqProcessReviewIntro}</p>
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                        >
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                                spacing="2xs"
                            >
                                <FaqHeading variant="subsection">
                                    {strings.faqProcessReviewEligibilityHeading}
                                </FaqHeading>
                                <p>{strings.faqProcessReviewEligibilityIntro}</p>
                                <ul>
                                    <li>{strings.faqProcessReviewEligibilityRules}</li>
                                    <li>{strings.faqProcessReviewEligibilityCompliance}</li>
                                    <li>{strings.faqProcessReviewEligibilityBudget}</li>
                                    <li>{strings.faqProcessReviewEligibilityRisks}</li>
                                </ul>
                                <p>{strings.faqProcessReviewEligibilityTiming}</p>
                            </ListView>
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                                spacing="2xs"
                            >
                                <FaqHeading variant="subsection">
                                    {strings.faqProcessReviewQualityHeading}
                                </FaqHeading>
                                <p>{strings.faqProcessReviewQualityIntro}</p>
                                <ul>
                                    <li>{strings.faqProcessReviewQualityNeeds}</li>
                                    <li>{strings.faqProcessReviewQualityTargeting}</li>
                                    <li>{strings.faqProcessReviewQualityCoherence}</li>
                                    <li>{strings.faqProcessReviewQualityFeasibility}</li>
                                    <li>{strings.faqProcessReviewQualityTechnical}</li>
                                    <li>{strings.faqProcessReviewQualityMonitoring}</li>
                                    <li>{strings.faqProcessReviewQualityCapacity}</li>
                                </ul>
                            </ListView>
                        </ListView>
                        <p>{strings.faqProcessReviewFinance}</p>
                        <p>{strings.faqProcessReviewComments}</p>
                        <p>{strings.faqProcessReviewCompleteIntro}</p>
                        <ul>
                            <li>{strings.faqProcessReviewChecklist}</li>
                            <li>{strings.faqProcessReviewAllocation}</li>
                            <li>{strings.faqProcessReviewPackage}</li>
                            <li>{strings.faqProcessReviewApproval}</li>
                            <li>{strings.faqProcessReviewAgreement}</li>
                        </ul>
                    </ListView>
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                        spacing="sm"
                    >
                        <FaqHeading variant="section">
                            {strings.faqProcessImplementationHeading}
                        </FaqHeading>
                        <p>{strings.faqProcessImplementationIntro}</p>
                        <ul>
                            <li>{strings.faqProcessImplementationDeliver}</li>
                            <li>{strings.faqProcessImplementationFunds}</li>
                            <li>{strings.faqProcessImplementationMonitor}</li>
                            <li>{strings.faqProcessImplementationCoordinate}</li>
                            <li>{strings.faqProcessImplementationCommunity}</li>
                            <li>{strings.faqProcessImplementationUpdates}</li>
                            <li>{strings.faqProcessImplementationReporting}</li>
                        </ul>
                        <p>{strings.faqProcessImplementationOutro}</p>
                    </ListView>
                </Faq>
                <Faq
                    name="advancePayment"
                    question={strings.faqAdvancePaymentQuestion}
                >
                    <p>{strings.faqAdvancePaymentIntro}</p>
                    <div className={styles.advancePaymentDetails}>
                        <div className={styles.block}>
                            <div className={styles.blockHeader}>
                                <div className={styles.blockTitle}>
                                    {strings.faqAdvancePaymentWhenToUseTitle}
                                </div>
                                <Chip
                                    className={styles.chip}
                                    name="suddenOnsetOnly"
                                    label={strings.faqAdvancePaymentSuddenOnsetChip}
                                    variant="tertiary"
                                />
                            </div>
                            <ul>
                                <li>{strings.faqAdvancePaymentBulletSuddenOnset}</li>
                                <li>{strings.faqAdvancePaymentBulletGoodStanding}</li>
                                <li>{strings.faqAdvancePaymentBulletCriteria}</li>
                                <li>{strings.faqAdvancePaymentBulletPlanning}</li>
                            </ul>
                        </div>
                        <div className={styles.block}>
                            <div className={styles.blockTitle}>
                                {strings.faqAdvancePaymentFunding}
                            </div>
                            <div className={styles.fundingRow}>
                                <div>{strings.faqAdvancePaymentYellowLabel}</div>
                                <div className={styles.fundingAmount}>
                                    {strings.faqAdvancePaymentYellowAmount}
                                </div>
                            </div>
                            <div className={styles.fundingRow}>
                                <div>{strings.faqAdvancePaymentOrangeRedLabel}</div>
                                <div className={styles.fundingAmount}>
                                    {strings.faqAdvancePaymentOrangeRedAmount}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Hidden until the form is published (LPC25): an advance payment
                        cannot be requested through the platform yet. */}
                    {isDefined(DREF_ADVANCE_PAYMENT_FORM_URL) && (
                        <ListView
                            withStartAlignment
                            withWrap
                        >
                            <DrefDocumentLink
                                name="advancePaymentForm"
                                url={DREF_ADVANCE_PAYMENT_FORM_URL}
                                label={strings.faqAdvancePaymentFormLink}
                            />
                        </ListView>
                    )}
                </Faq>
            </FaqList>
            <DrefDecisionTreeCallout />
            <DrefOperationsMap />
            <DrefOperationsTable />
            <DrefKeyResources variant="response" />
        </TabPage>
    );
}

Component.displayName = 'DrefResponsePillar';
