import { useState } from 'react';
import {
    DropdownMenu,
    NavigationTabList,
    PageContainer,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import goLogo from '#assets/icons/go-logo-2020.svg';
import KeywordSearchSelectInput from '#components/domain/KeywordSearchSelectInput';
import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';

import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import CountryDropdown from './CountryDropdown';
import LangaugeDropdown from './LanguageDropdown';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    const { isAuthenticated } = useAuth();
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
                    {!isAuthenticated && (
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
                        label={strings.userMenuPrepare}
                        variant="tertiary"
                        persistent
                        preferredPopupWidth={56}
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
                                    {strings.userMenuRiskAnalysisLabel}
                                </Tab>
                                <Tab
                                    name="per"
                                    className={styles.option}
                                >
                                    {strings.userMenuPERLabel}
                                </Tab>
                                <Tab
                                    name="global-3w-projects"
                                    className={styles.option}
                                >
                                    {strings.userMenuGlobal3WProjects}
                                </Tab>
                            </TabList>
                            <div className={styles.optionBorder} />
                            <TabPanel
                                name="risk-analysis"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {strings.userMenuGlobalRiskDescription}
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
                                    {strings.userMenuPERDescription}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalSummary"
                                    variant="tertiary"
                                >
                                    {strings.userMenuGlobalSummary}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalPerformance"
                                    variant="tertiary"
                                >
                                    {strings.userMenuGlobalPerformance}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalCatalogue"
                                    variant="tertiary"
                                >
                                    {strings.userMenuCatalogueResources}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalOperational"
                                    variant="tertiary"
                                >
                                    {strings.userMenuOperationalLearning}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="perProcessLayout"
                                    variant="secondary"
                                >
                                    {strings.userMenuStartPER}
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="global-3w-projects"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {strings.userMenuGlobal3WProjectDescription}
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
                                    {strings.userMenuSubmit3WProject}
                                </DropdownMenuItem>
                            </TabPanel>
                        </Tabs>
                    </DropdownMenu>
                    <DropdownMenu
                        popupClassName={styles.dropdown}
                        label={strings.userMenuRespondLabel}
                        variant="tertiary"
                        persistent
                        preferredPopupWidth={56}
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
                                    {strings.userMenuEmergencies}
                                </Tab>
                                <Tab
                                    name="early-warning"
                                    className={styles.option}
                                >
                                    {strings.userMenuEarlyWarning}
                                </Tab>
                                <Tab
                                    name="dref-process"
                                    className={styles.option}
                                >
                                    {strings.userMenuDrefProcess}
                                </Tab>
                                <Tab
                                    name="surge"
                                    className={styles.option}
                                >
                                    {strings.userMenuSurgeDeployments}
                                </Tab>
                            </TabList>
                            <div className={styles.optionBorder} />
                            <TabPanel
                                name="emergencies"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {strings.userMenuEmergenciesDescription}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="emergencies"
                                    variant="tertiary"
                                >
                                    {strings.userMenuOngoingEmergencies}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="fieldReportFormNew"
                                    variant="secondary"
                                >
                                    {strings.userMenuCreateFieldReport}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="newThreeWActivity"
                                    variant="secondary"
                                >
                                    {strings.userMenuSubmit3WActivity}
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="early-warning"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {strings.userMenuEarlyWarningDescription}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="fieldReportFormNew"
                                    variant="secondary"
                                    state={{ earlyWarning: true }}
                                >
                                    {strings.userMenuCreateEarlyActionFieldReport}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="flashUpdateFormNew"
                                    variant="secondary"
                                >
                                    {strings.userMenuCreateFlashUpdate}
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="dref-process"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {strings.userMenuDrefProcessDescription}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="accountMyFormsDref"
                                    variant="tertiary"
                                >
                                    {strings.myDrefApplications}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="newDrefApplicationForm"
                                    variant="secondary"
                                >
                                    {strings.userMenuCreateDrefApplication}
                                </DropdownMenuItem>
                            </TabPanel>
                            <TabPanel
                                name="surge"
                                className={styles.optionDetail}
                            >
                                <div className={styles.description}>
                                    {strings.userMenuSurge}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOverview"
                                    variant="tertiary"
                                >
                                    {strings.userMenuSurgeGlobalOverview}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOperationalToolbox"
                                    variant="tertiary"
                                >
                                    {strings.userMenuOperationalToolbox}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeCatalogueLayout"
                                    variant="tertiary"
                                >
                                    {strings.userMenuCatalogueSurgeServices}
                                </DropdownMenuItem>
                            </TabPanel>
                        </Tabs>
                    </DropdownMenu>
                    <DropdownMenu
                        popupClassName={styles.dropdown}
                        label={strings.userMenuLearnLabel}
                        variant="tertiary"
                        persistent
                        preferredPopupWidth={56}
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
                                    name="operational-learnings"
                                >
                                    {strings.userMenuOperationalLearnings}
                                </Tab>
                                <Tab
                                    name="tools"
                                    className={styles.option}
                                >
                                    {strings.userMenuTools}
                                </Tab>
                                <Tab
                                    name="resources"
                                    className={styles.option}
                                >
                                    {strings.userMenuResources}
                                </Tab>
                                <DropdownMenuItem
                                    external
                                    className={styles.option}
                                    type="link"
                                    href="https://ifrcgoproject.medium.com/"
                                    variant="tertiary"
                                    withLinkIcon
                                >
                                    {strings.userMenuGoBlog}
                                </DropdownMenuItem>
                            </TabList>
                            <div className={styles.optionBorder} />
                            <TabPanel
                                name="operational-learnings"
                                className={styles.optionDetail}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="operationalLearnings"
                                    variant="tertiary"
                                >
                                    {strings.userMenuOperationalLearnings}
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {strings.userMenuOperationalLearningsDescription}
                                </div>
                            </TabPanel>
                            <TabPanel
                                name="tools"
                                className={styles.optionDetail}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOperationalToolbox"
                                    variant="tertiary"
                                >
                                    {strings.userMenuOperationalToolboxItem}
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {strings.userMenuOperationalToolboxItemDescription}
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
                                    {strings.userMenuCatalogueSurgeServicesItem}
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {strings.userMenuCatalogueSurgeServicesItem}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="preparednessGlobalCatalogue"
                                    variant="tertiary"
                                    state={{ earlyWarning: true }}
                                >
                                    {strings.userMenuPERCatalogueItem}
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {strings.userMenuPERCatalogueItemDescription}
                                </div>
                                <DropdownMenuItem
                                    type="link"
                                    to="resources"
                                    variant="tertiary"
                                    state={{ earlyWarning: true }}
                                >
                                    {strings.userMenuGoResourcesItem}
                                </DropdownMenuItem>
                                <div className={styles.description}>
                                    {strings.userMenuGoResourcesItemDescription}
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
