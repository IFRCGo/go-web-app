import { useState } from 'react';
import {
    Container,
    Description,
    Heading,
    ListView,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DrefDecisionTreeCallout from '#components/domain/DrefDecisionTreeCallout';
import DrefDocumentLink from '#components/domain/DrefDocumentLink';
import DrefKeyResources from '#components/domain/DrefKeyResources';
import Faq, { type FaqItem } from '#components/domain/Faq';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { DREF_TYPE_IMMINENT } from '#utils/constants';
import {
    DREF_AA_MANUAL_URL,
    DREF_ANTICIPATORY_GUIDANCE_URL,
    getNewDrefRouteState,
} from '#utils/domain/dref';

import EapMap from './EapMap';
import EapTable from './EapTable';
import ImminentDrefMap from './ImminentDrefMap';
import ImminentDrefTable from './ImminentDrefTable';

import i18n from './i18n.json';

type SubTab = 'imminent' | 'eap';

const imminentDrefRouteState = getNewDrefRouteState(DREF_TYPE_IMMINENT);

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('imminent');

    const imminentFaqItems: FaqItem[] = [
        {
            name: 'imminentDref',
            question: strings.faqImminentDrefQuestion,
            answer: (
                <>
                    <p>{strings.faqImminentDrefIntro}</p>
                    <p>{strings.faqImminentDrefScope}</p>
                    <ul>
                        <li>{strings.faqImminentDrefBulletNotYet}</li>
                        <li>{strings.faqImminentDrefBulletUnfolding}</li>
                    </ul>
                    <p>{strings.faqImminentDrefOutro}</p>
                </>
            ),
        },
        {
            name: 'imminentCharacteristics',
            question: strings.faqImminentCharacteristicsQuestion,
            answer: (
                <ul>
                    <li>{strings.faqImminentCharTimeframe}</li>
                    <li>{strings.faqImminentCharTrigger}</li>
                    <li>
                        {strings.faqImminentCharThresholds}
                        <ul>
                            <li>{strings.faqImminentCharThresholdsNoRrp}</li>
                            <li>{strings.faqImminentCharThresholdsWithRrp}</li>
                        </ul>
                    </li>
                    <li>
                        {strings.faqImminentCharComponents}
                        <ul>
                            <li>{strings.faqImminentCharEarlyAction}</li>
                            <li>{strings.faqImminentCharEarlyResponse}</li>
                        </ul>
                    </li>
                </ul>
            ),
        },
        {
            name: 'imminentProcess',
            question: strings.faqImminentProcessQuestion,
            answer: (
                <>
                    <Heading level={6}>{strings.faqImminentProcessPlanningHeading}</Heading>
                    <ul>
                        <li>{strings.faqImminentProcessPlanningTemplate}</li>
                        <li>{strings.faqImminentProcessPlanningTiming}</li>
                        <li>{strings.faqImminentProcessPlanningBudget}</li>
                        <li>{strings.faqImminentProcessPlanningBankLetter}</li>
                        <li>{strings.faqImminentProcessPlanningSubmit}</li>
                    </ul>
                    <Heading level={6}>{strings.faqImminentProcessImplementationHeading}</Heading>
                    <ul>
                        <li>{strings.faqImminentProcessImplBegin}</li>
                        <li>{strings.faqImminentProcessImplEnsure}</li>
                        <li>{strings.faqImminentProcessImplFunds}</li>
                        <li>{strings.faqImminentProcessImplGovernment}</li>
                        <li>{strings.faqImminentProcessImplCoordinate}</li>
                    </ul>
                    <Heading level={6}>{strings.faqImminentProcessReportingHeading}</Heading>
                    <ul>
                        <li>
                            {strings.faqImminentProcessScenarioOne}
                            <ul>
                                <li>{strings.faqImminentProcessScenarioOneReport}</li>
                                <li>{strings.faqImminentProcessScenarioOneBalance}</li>
                            </ul>
                        </li>
                        <li>
                            {strings.faqImminentProcessScenarioTwo}
                            <ul>
                                <li>{strings.faqImminentProcessScenarioTwoRequest}</li>
                            </ul>
                        </li>
                    </ul>
                </>
            ),
        },
    ];

    const eapFaqItems: FaqItem[] = [
        {
            name: 'fullEap',
            question: strings.faqFullEapQuestion,
            answer: (
                <>
                    <p>{strings.faqFullEapIntro}</p>
                    <p>{strings.faqFullEapIncludes}</p>
                    <ul>
                        <li>{strings.faqFullEapBulletHazard}</li>
                        <li>{strings.faqFullEapBulletTrigger}</li>
                        <li>{strings.faqFullEapBulletActivities}</li>
                        <li>{strings.faqFullEapBulletRoles}</li>
                        <li>{strings.faqFullEapBulletBudget}</li>
                    </ul>
                    <p>{strings.faqFullEapOutro}</p>
                </>
            ),
        },
        {
            name: 'eapCharacteristics',
            question: strings.faqEapCharacteristicsQuestion,
            answer: (
                <ul>
                    <li>{strings.faqEapCharPurpose}</li>
                    <li>{strings.faqEapCharTimeframe}</li>
                    <li>{strings.faqEapCharCoverage}</li>
                    <li>{strings.faqEapCharScale}</li>
                    <li>
                        {strings.faqEapCharTrigger}
                        <ul>
                            <li>{strings.faqEapCharTriggerEstablished}</li>
                            <li>{strings.faqEapCharTriggerContext}</li>
                            <li>{strings.faqEapCharTriggerDatabase}</li>
                        </ul>
                    </li>
                    <li>{strings.faqEapCharTriggerReached}</li>
                    <li>{strings.faqEapCharBudget}</li>
                    <li>
                        {strings.faqEapCharComponents}
                        <ul>
                            <li>{strings.faqEapCharPrepositioned}</li>
                            <li>{strings.faqEapCharReadiness}</li>
                            <li>{strings.faqEapCharEarlyAction}</li>
                        </ul>
                    </li>
                </ul>
            ),
        },
        {
            name: 'seap',
            question: strings.faqSeapQuestion,
            answer: (
                <>
                    <p>{strings.faqSeapIntro}</p>
                    <ul>
                        <li>{strings.faqSeapBulletNoPartner}</li>
                        <li>{strings.faqSeapBulletSmallerScale}</li>
                        <li>{strings.faqSeapBulletNewHazard}</li>
                    </ul>
                </>
            ),
        },
        {
            name: 'seapCharacteristics',
            question: strings.faqSeapCharacteristicsQuestion,
            answer: (
                <ul>
                    <li>{strings.faqSeapCharPurpose}</li>
                    <li>{strings.faqSeapCharTimeframe}</li>
                    <li>{strings.faqSeapCharCoverage}</li>
                    <li>{strings.faqSeapCharScale}</li>
                    <li>{strings.faqSeapCharTrigger}</li>
                    <li>{strings.faqSeapCharBudget}</li>
                    <li>{strings.faqSeapCharComponents}</li>
                </ul>
            ),
        },
        {
            name: 'eapProcess',
            question: strings.faqEapProcessQuestion,
            answer: (
                <>
                    <Heading level={6}>{strings.faqEapProcessDevelopmentHeading}</Heading>
                    <ol>
                        <li>{strings.faqEapProcessDevRegister}</li>
                        <li>
                            {strings.faqEapProcessDevAccessForm}
                            &nbsp;
                            <Link
                                external
                                href={DREF_AA_MANUAL_URL}
                                withUnderline
                            >
                                {strings.faqEapProcessDevAccessFormLink}
                            </Link>
                            .
                        </li>
                        <li>{strings.faqEapProcessDevSubmit}</li>
                        <li>{strings.faqEapProcessDevStatusUnderReview}</li>
                        <li>{strings.faqEapProcessDevInitialReview}</li>
                        <li>{strings.faqEapProcessDevAddressComments}</li>
                        <li>{strings.faqEapProcessDevNoteBelowStandards}</li>
                        <li>
                            {strings.faqEapProcessDevNextVersions}
                            <ul>
                                <li>{strings.faqEapProcessDevValidate}</li>
                                <li>{strings.faqEapProcessDevSupplementary}</li>
                            </ul>
                            <p>{strings.faqEapProcessDevNoteIterations}</p>
                        </li>
                        <li>{strings.faqEapProcessDevBudgetValidation}</li>
                        <li>{strings.faqEapProcessDevApproval}</li>
                    </ol>
                    <Heading level={6}>{strings.faqEapProcessManagementHeading}</Heading>
                    <Heading level={6}>{strings.faqEapProcessAgreementHeading}</Heading>
                    <p>{strings.faqEapProcessAgreementSign}</p>
                    <p>{strings.faqEapProcessAgreementStatus}</p>
                    <Heading level={6}>{strings.faqEapProcessStockHeading}</Heading>
                    <ul>
                        <li>{strings.faqEapProcessStockProcure}</li>
                        <li>{strings.faqEapProcessStockReadiness}</li>
                    </ul>
                    <Heading level={6}>{strings.faqEapProcessTriggerHeading}</Heading>
                    <ul>
                        <li>{strings.faqEapProcessTriggerMonitor}</li>
                        <li>
                            {strings.faqEapProcessTriggerAnnounce}
                            <p>{strings.faqEapProcessTriggerNoteExceptional}</p>
                        </li>
                        <li>{strings.faqEapProcessTriggerImplement}</li>
                    </ul>
                    <Heading level={6}>{strings.faqEapProcessReportingHeading}</Heading>
                    <ul>
                        <li>{strings.faqEapProcessReportingAnnual}</li>
                        <li>
                            {strings.faqEapProcessReportingIfActivated}
                            <ul>
                                <li>{strings.faqEapProcessReportingWorkshop}</li>
                                <li>{strings.faqEapProcessReportingActivationReport}</li>
                            </ul>
                        </li>
                        <li>{strings.faqEapProcessReportingFinalReport}</li>
                    </ul>
                    <Heading level={6}>{strings.faqEapProcessRevisionHeading}</Heading>
                    <ul>
                        <li>{strings.faqEapProcessRevisionRevise}</li>
                        <li>{strings.faqEapProcessRevisionResubmit}</li>
                    </ul>
                </>
            ),
        },
    ];

    return (
        <TabPage>
            <ListView
                layout="grid"
                numPreferredGridColumns={3}
                spacing="lg"
                minGridColumnSize="16rem"
            >
                <ListView layout="block">
                    <Description>
                        <p>{strings.anticipatoryIntroOne}</p>
                        <p>{strings.anticipatoryIntroTwo}</p>
                    </Description>
                    {/* TODO: confirm placement with design (LPF02). */}
                    <ListView
                        withStartAlignment
                        withWrap
                    >
                        <DrefDocumentLink
                            name="fullAnticipatoryGuidance"
                            url={DREF_ANTICIPATORY_GUIDANCE_URL}
                            label={strings.fullAnticipatoryGuidanceLink}
                        />
                    </ListView>
                </ListView>
                <Container
                    heading={strings.imminentCardHeading}
                    withHeaderBorder
                    withBackground
                    withShadow
                    withPadding
                >
                    <p>{strings.imminentCardText}</p>
                    <Link
                        to="newDrefApplicationForm"
                        state={imminentDrefRouteState}
                        styleVariant="outline"
                        colorVariant="primary"
                    >
                        {strings.imminentCardButton}
                    </Link>
                </Container>
                <Container
                    heading={strings.eapCardHeading}
                    withHeaderBorder
                    withBackground
                    withShadow
                    withPadding
                >
                    <p>{strings.eapCardText}</p>
                    <Link
                        to="newEapDevelopmentRegistration"
                        styleVariant="outline"
                        colorVariant="primary"
                    >
                        {strings.eapCardButton}
                    </Link>
                </Container>
            </ListView>
            <Tabs
                value={activeSubTab}
                onChange={setActiveSubTab}
                styleVariant="pill"
            >
                <TabList>
                    <Tab name="imminent">{strings.subTabImminent}</Tab>
                    <Tab name="eap">{strings.subTabEap}</Tab>
                </TabList>
                <TabPanel name="imminent">
                    <ListView
                        layout="block"
                        spacing="2xl"
                    >
                        <Description>{strings.imminentTabDescription}</Description>
                        <Faq items={imminentFaqItems} />
                        <DrefDecisionTreeCallout />
                        <ImminentDrefMap />
                        <ImminentDrefTable />
                        <DrefKeyResources variant="anticipatory" />
                    </ListView>
                </TabPanel>
                <TabPanel name="eap">
                    <ListView
                        layout="block"
                        spacing="xl"
                    >
                        <Description>
                            <p>{strings.eapTabDescriptionLead}</p>
                            <p>{strings.eapTabDescriptionEap}</p>
                            <p>{strings.eapTabDescriptionSeap}</p>
                        </Description>
                        <Faq items={eapFaqItems} />
                        <DrefDecisionTreeCallout />
                        <EapMap />
                        <EapTable />
                        <DrefKeyResources variant="anticipatory" />
                    </ListView>
                </TabPanel>
            </Tabs>
        </TabPage>
    );
}

Component.displayName = 'DrefAnticipatoryPillar';
