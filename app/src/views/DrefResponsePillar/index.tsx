import {
    Chip,
    Description,
    Heading,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DrefDecisionTreeCallout from '#components/domain/DrefDecisionTreeCallout';
import DrefDocumentLink from '#components/domain/DrefDocumentLink';
import DrefKeyResources from '#components/domain/DrefKeyResources';
import Faq, { type FaqItem } from '#components/domain/Faq';
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

    const faqItems: FaqItem[] = [
        {
            name: 'responseDref',
            question: strings.faqResponseDrefQuestion,
            answer: (
                <>
                    <p>{strings.faqResponseDrefParaOne}</p>
                    <p>{strings.faqResponseDrefParaTwo}</p>
                    <p>{strings.faqResponseDrefParaThree}</p>
                </>
            ),
        },
        {
            name: 'characteristics',
            question: strings.faqCharacteristicsQuestion,
            answer: (
                <ul>
                    <li>{strings.faqCharTimeframe}</li>
                    <li>{strings.faqCharTrigger}</li>
                    <li>{strings.faqCharThresholds}</li>
                    <li>
                        {strings.faqCharComponents}
                        <ul>
                            <li>{strings.faqCharComponentsDirect}</li>
                            <li>{strings.faqCharComponentsAssessments}</li>
                            <li>{strings.faqCharComponentsHumanResources}</li>
                            <li>{strings.faqCharComponentsEarlyRecovery}</li>
                        </ul>
                    </li>
                    <li>{strings.faqCharPlanning}</li>
                    <li>{strings.faqCharCost}</li>
                    <li>
                        {strings.faqCharConsiderations}
                        <ul>
                            <li>
                                <Link
                                    external
                                    href={DREF_GUIDELINES_DROUGHT_URL}
                                    withUnderline
                                >
                                    {strings.faqCharConsiderationDroughtLink}
                                </Link>
                                &nbsp;
                                {strings.faqCharConsiderationDrought}
                            </li>
                            <li>{strings.faqCharConsiderationAssessments}</li>
                            <li>
                                <Link
                                    external
                                    href={DREF_GUIDELINES_READINESS_URL}
                                    withUnderline
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
                                >
                                    {strings.faqCharConsiderationLoanLink}
                                </Link>
                                &nbsp;
                                {strings.faqCharConsiderationLoan}
                            </li>
                        </ul>
                    </li>
                </ul>
            ),
        },
        {
            name: 'responseProcess',
            question: strings.faqResponseProcessQuestion,
            answer: (
                <>
                    <Heading level={6}>{strings.faqProcessPlanningHeading}</Heading>
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
                    <Heading level={6}>{strings.faqProcessReviewHeading}</Heading>
                    <p>{strings.faqProcessReviewIntro}</p>
                    <Heading level={6}>{strings.faqProcessReviewEligibilityHeading}</Heading>
                    <p>{strings.faqProcessReviewEligibilityIntro}</p>
                    <ul>
                        <li>{strings.faqProcessReviewEligibilityRules}</li>
                        <li>{strings.faqProcessReviewEligibilityCompliance}</li>
                        <li>{strings.faqProcessReviewEligibilityBudget}</li>
                        <li>{strings.faqProcessReviewEligibilityRisks}</li>
                    </ul>
                    <p>{strings.faqProcessReviewEligibilityTiming}</p>
                    <Heading level={6}>{strings.faqProcessReviewQualityHeading}</Heading>
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
                    <Heading level={6}>{strings.faqProcessImplementationHeading}</Heading>
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
                </>
            ),
        },
        {
            name: 'advancePayment',
            question: strings.faqAdvancePaymentQuestion,
            answer: (
                <>
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
                </>
            ),
        },
    ];

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
            <Faq items={faqItems} />
            <DrefDecisionTreeCallout />
            <DrefOperationsMap />
            <DrefOperationsTable />
            <DrefKeyResources variant="response" />
        </TabPage>
    );
}

Component.displayName = 'DrefResponsePillar';
