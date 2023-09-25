import { useContext, useState } from 'react';
import { isNotDefined, _cs } from '@togglecorp/fujs';

import PageContainer from '#components/PageContainer';
import Link from '#components/Link';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import KeywordSearchSelectInput from '#components/domain/KeywordSearchSelectInput';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';
import { environment } from '#config';
import goLogo from '#assets/icons/go-logo-2020.svg';
import TabList from '#components/Tabs/TabList';
import Tabs from '#components/Tabs';
import Tab from '#components/Tabs/Tab';
import TabPanel from '#components/Tabs/TabPanel';

import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import LangaugeDropdown from './LanguageDropdown';
import i18n from './i18n.json';
import styles from './styles.module.css';
import CountryDropdown from './CountryDropdown';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    const { userAuth: userDetails } = useContext(UserContext);
    const strings = useTranslation(i18n);

    type PrepareOptionKey = 'risk-analysis' | 'per' | 'global-3w-projects';
    const [activePrepareOption, setActivePrepareOption] = useState<PrepareOptionKey>('risk-analysis');

    type RespondOptionKey = 'emergencies' | 'early-warning' | 'dref-process' | 'surge';
    const [activeRespondOption, setActiveRespondOption] = useState<RespondOptionKey>('emergencies');

    type LearnOptionKey = 'tools' | 'resources';
    const [activeLearnOption, setActiveLearnOption] = useState<LearnOptionKey>('tools');

    return (
        <nav className={_cs(styles.navbar, className)}>
            <PageContainer
                className={styles.top}
                contentClassName={styles.topContent}
            >
                <div className={styles.brand}>
                    <Link to="home">
                        <img
                            className={styles.goIcon}
                            src={goLogo}
                            alt={strings.headerLogoAltText}
                        />
                    </Link>
                    {environment !== 'production' && (
                        <div className={styles.env}>
                            {environment}
                        </div>
                    )}
                </div>
                <NavigationTabList
                    className={styles.actions}
                    variant="tertiary"
                >
                    <LangaugeDropdown />
                    {isNotDefined(userDetails) && (
                        <>
                            <NavigationTab
                                to="login"
                                className={styles.actionItem}
                            >
                                {strings.userMenuLogin}
                            </NavigationTab>
                            <NavigationTab
                                to="register"
                                className={styles.actionItem}
                            >
                                {strings.userMenuRegister}
                            </NavigationTab>
                        </>
                    )}
                    <AuthenticatedUserDropdown />
                    <DropdownMenu
                        label={strings.headerCreateAReportLabel}
                    >
                        <DropdownMenuItem
                            type="link"
                            to="fieldReportFormNew"
                        >
                            {strings.headerDropdownNewFieldReport}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            to="newThreeWActivity"
                        >
                            {strings.headerDropdownNew3WActivity}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            to="newDrefApplicationForm"
                        >
                            {strings.headerDropdownNewDrefApplication}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            to="flashUpdateFormNew"
                        >
                            {strings.headerDropdownNewFlashUpdate}
                        </DropdownMenuItem>
                    </DropdownMenu>
                </NavigationTabList>
            </PageContainer>
            <PageContainer
                contentClassName={styles.bottom}
            >
                <NavigationTabList
                    className={styles.menuItems}
                    variant="tertiary"
                >
                    <NavigationTab
                        to="home"
                        className={styles.menuItem}
                    >
                        {strings.headerMenuHome}
                    </NavigationTab>
                    <CountryDropdown />
                    <DropdownMenu
                        popupClassName={styles.dropdown}
                        // FIXME: use translations
                        label="Prepare"
                        variant="tertiary"
                        persistent
                    >
                        <Tabs
                            value={activePrepareOption}
                            onChange={setActivePrepareOption}
                            variant="vertical-compact"
                        >
                            <TabList
                                className={styles.optionList}
                                contentClassName={styles.optionListContent}
                            >
                                <Tab
                                    name="risk-analysis"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Risk Analysis
                                </Tab>
                                <Tab
                                    name="per"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Preparedness for Effective Response (PER)
                                </Tab>
                                <Tab
                                    name="global-3w-projects"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Global 3W Projects
                                </Tab>
                            </TabList>
                            <div className={styles.optionBorder} />
                            <TabPanel
                                name="risk-analysis"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    The global risk overview presents information about the
                                    magnitude of risks per country, per month based on
                                    historical events and risk analysis.
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="riskWatchLayout"
                                    variant="tertiary"
                                >
                                    {strings.headerMenuRiskWatch}
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="per"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    The PER Approach is a continuous and flexible process that
                                    enables National Societies to assess, measure and analyse
                                    the strengths and gaps of its preparedness and response
                                    mechanism.
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalSummary"
                                    variant="tertiary"
                                >
                                    Global Summary
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalPerformance"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Global Performance
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalCatalogue"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Catalogue of Resources
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalOperational"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Operational Learning
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="perProcessLayout"
                                    variant="secondary"
                                >
                                    {/* FIXME: use translations */}
                                    Start PER Process
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="global-3w-projects"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    {`The "Who does What, Where" or 3W aims to map the global
                                    footprint of the Red Cross Red Crescent Movement, as
                                    reported by the National Societies.`}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="globalThreeW"
                                    variant="tertiary"
                                >
                                    {strings.headerMenuThreeW}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="newThreeWProject"
                                    variant="secondary"
                                >
                                    {/* FIXME: use translations */}
                                    Submit 3W Project
                                </DropdownMenuItem>
                            </TabPanel>
                        </Tabs>
                    </DropdownMenu>
                    <DropdownMenu
                        popupClassName={styles.dropdown}
                        // FIXME: use translations
                        label="Respond"
                        variant="tertiary"
                        persistent
                    >
                        <Tabs
                            value={activeRespondOption}
                            onChange={setActiveRespondOption}
                            variant="vertical-compact"
                        >
                            <TabList
                                className={styles.optionList}
                                contentClassName={styles.optionListContent}
                            >
                                <Tab
                                    name="emergencies"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Emergencies
                                </Tab>
                                <Tab
                                    name="early-warning"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Early Warning
                                </Tab>
                                <Tab
                                    name="dref-process"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Dref Process
                                </Tab>
                                <Tab
                                    name="surge"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Surge/Deployments
                                </Tab>
                            </TabList>
                            <div className={styles.optionBorder} />
                            <TabPanel
                                name="emergencies"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    Follow curretly ongoing emergencies, as well as access the
                                    list of previous emergencies of IFRC-led operations.
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="emergencies"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Ongoing Emergencies
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="fieldReportFormNew"
                                    variant="secondary"
                                >
                                    {/* FIXME: use translations */}
                                    Create Field report
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="newThreeWActivity"
                                    variant="secondary"
                                >
                                    {/* FIXME: use translations */}
                                    Submit 3W Activity
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="early-warning"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    Early Warning focuses on preparatory action ahead of possible
                                    disasters and events. Use one of the following links to submit
                                    information on early warning.
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="fieldReportFormNew"
                                    variant="secondary"
                                    state={{ earlyWarning: true }}
                                >
                                    {/* FIXME: use translations */}
                                    Create Early Action Field Report
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to={undefined}
                                    variant="secondary"
                                >
                                    {/* FIXME: use translations */}
                                    Submit EAP Activation
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to={undefined}
                                    variant="secondary"
                                >
                                    {/* FIXME: use translations */}
                                    Submit EAP Final Report
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="flashUpdateFormNew"
                                    variant="secondary"
                                >
                                    {/* FIXME: use translations */}
                                    Create Flash Update
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="dref-process"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    Disaster Response Emergency Fund (DREF) is the quickest way of
                                    getting funding directly to local humanitarian actors. Use one
                                    of the links below to submit a DREF Application or an update.
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="newDrefApplicationForm"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Create DREF Application
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="surge"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    The section displays the summary of deployments within current
                                    and ongoing emergencies. Login to see available details
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOverview"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Surge Global Overview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOperationalToolbox"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Operational Toolbox
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeCatalogueLayout"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Catalogue of Surge Services
                                </DropdownMenuItem>
                            </TabPanel>
                        </Tabs>
                    </DropdownMenu>
                    <DropdownMenu
                        popupClassName={styles.dropdown}
                        // FIXME: use translations
                        label="Learn"
                        variant="tertiary"
                        persistent
                    >
                        <Tabs
                            value={activeLearnOption}
                            onChange={setActiveLearnOption}
                            variant="vertical-compact"
                        >
                            <TabList
                                className={styles.optionList}
                                contentClassName={styles.optionListContent}
                            >
                                <Tab
                                    name="tools"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Tools
                                </Tab>
                                <Tab
                                    name="resources"
                                    className={styles.option}
                                >
                                    {/* FIXME: use translations */}
                                    Resources
                                </Tab>
                                <DropdownMenuItem
                                    external
                                    className={styles.option}
                                    type="link"
                                    href="https://ifrcgoproject.medium.com/"
                                    variant="tertiary"
                                    withLinkIcon
                                >
                                    {/* FIXME: use translations */}
                                    GO Blog
                                </DropdownMenuItem>
                            </TabList>
                            <div className={styles.optionBorder} />
                            <TabPanel
                                name="tools"
                                className={styles.optionDetail}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOperationalToolbox"
                                    variant="tertiary"
                                >
                                    {/* FIXME: use translations */}
                                    Operational Toolbox
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    This operational toolbox is a central repository
                                    with key operational document helpful for your
                                    mission like templates, checklists, guidance and examples.
                                </div>
                            </TabPanel>
                            <TabPanel
                                name="resources"
                                className={styles.optionDetail}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeCatalogueLayout"
                                    variant="tertiary"
                                    state={{ earlyWarning: true }}
                                >
                                    {/* FIXME: use translations */}
                                    Catalogue of Surge Services
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    Catalogue of Surge Services contains all relevant content
                                    and materials related to Surge.
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalCatalogue"
                                    variant="tertiary"
                                    state={{ earlyWarning: true }}
                                >
                                    {/* FIXME: use translations */}
                                    PER Catalogue of Resources
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    PER Catalogue of Resources contains resource relevant to
                                    strengthening resource and capactiy.
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="resources"
                                    variant="tertiary"
                                    state={{ earlyWarning: true }}
                                >
                                    {/* FIXME: use translations */}
                                    GO Resources
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {/* FIXME: use translations */}
                                    Find all relevant user guides, references videos, IFRC
                                    other resources, and GO contacts on this page.
                                </div>
                            </TabPanel>
                        </Tabs>
                    </DropdownMenu>
                </NavigationTabList>
                <div className={styles.searchContainer}>
                    <KeywordSearchSelectInput />
                </div>
            </PageContainer>
        </nav>
    );
}

export default Navbar;
