import { useState } from 'react';
import {
    Description,
    DropdownMenu,
    ListView,
    NavigationTabList,
    PageContainer,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import goLogo from '#assets/icons/go-logo-2020.svg';
import KeywordSearchSelectInput from '#components/domain/KeywordSearchSelectInput';
import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import {
    environment,
    sdtUrl,
} from '#config';
import useAuth from '#hooks/domain/useAuth';

import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import CountryDropdown from './CountryDropdown';
import LanguageDropdown from './LanguageDropdown';

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

    type PrepareOptionKey = 'risk-analysis' | 'per' | 'global-logistics';
    const [activePrepareOption, setActivePrepareOption] = useState<PrepareOptionKey>('risk-analysis');

    type RespondOptionKey = 'emergencies' | 'early-warning' | 'dref-process' | 'surge';
    const [activeRespondOption, setActiveRespondOption] = useState<RespondOptionKey>('emergencies');

    type LearnOptionKey = 'tools' | 'resources' | 'operational-learning';
    const [activeLearnOption, setActiveLearnOption] = useState<LearnOptionKey>('operational-learning');

    return (
        <nav className={_cs(styles.navbar, className)}>
            <PageContainer
                className={styles.top}
                contentClassName={styles.topContent}
            >
                <ListView
                    withWrap
                    withSpaceBetweenContents
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
                    <NavigationTabList styleVariant="nav">
                        <LanguageDropdown />
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
                            labelColorVariant="primary"
                            labelSpacing="lg"
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
                </ListView>
            </PageContainer>
            <PageContainer
                contentClassName={styles.bottomContent}
            >
                <ListView
                    withWrap
                    withSpaceBetweenContents
                >
                    <NavigationTabList
                        styleVariant="nav"
                        spacing="lg"
                    >
                        <NavigationTab
                            to="home"
                            withoutPadding
                        >
                            {strings.headerMenuHome}
                        </NavigationTab>
                        <CountryDropdown />
                        <DropdownMenu
                            popupClassName={styles.dropdown}
                            label={strings.userMenuPrepare}
                            labelColorVariant="text"
                            labelStyleVariant="action"
                            persistent
                            preferredPopupWidth={56}
                        >
                            <Tabs
                                value={activePrepareOption}
                                onChange={setActivePrepareOption}
                                styleVariant="vertical-compact"
                            >
                                <TabList className={styles.optionList}>
                                    <Tab name="risk-analysis">
                                        {strings.userMenuRiskAnalysisLabel}
                                    </Tab>
                                    <Tab name="per">
                                        {strings.userMenuPERLabel}
                                    </Tab>
                                    <Tab name="global-logistics">
                                        {strings.userMenuGlobalLogistics}
                                    </Tab>
                                </TabList>
                                <div className={styles.optionBorder} />
                                <TabPanel name="risk-analysis">
                                    <ListView layout="block">
                                        <Description
                                            withLightText
                                            textSize="sm"
                                        >
                                            {strings.userMenuGlobalRiskDescription}
                                        </Description>
                                        <DropdownMenuItem
                                            type="link"
                                            to="riskWatchLayout"
                                            styleVariant="action"
                                            withoutFullWidth
                                        >
                                            {strings.headerMenuRiskWatch}
                                        </DropdownMenuItem>
                                    </ListView>
                                </TabPanel>
                                <TabPanel name="per">
                                    <ListView layout="block">
                                        <Description
                                            className={styles.description}
                                            withLightText
                                            textSize="sm"
                                        >
                                            {strings.userMenuPERDescription}
                                        </Description>
                                        <ListView
                                            layout="block"
                                            withSpacingOpticalCorrection
                                            spacing="sm"
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="preparednessGlobalSummary"
                                                styleVariant="action"
                                                withoutFullWidth
                                            >
                                                {strings.userMenuGlobalSummary}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                type="link"
                                                to="preparednessGlobalPerformance"
                                                styleVariant="action"
                                                withoutFullWidth
                                            >
                                                {strings.userMenuGlobalPerformance}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                type="link"
                                                to="preparednessGlobalCatalogue"
                                                styleVariant="action"
                                                withoutFullWidth
                                            >
                                                {strings.userMenuCatalogueResources}
                                            </DropdownMenuItem>
                                        </ListView>
                                        <DropdownMenuItem
                                            type="link"
                                            to="perProcessLayout"
                                            colorVariant="primary"
                                            styleVariant="action"
                                            withoutFullWidth
                                        >
                                            {strings.userMenuStartPER}
                                        </DropdownMenuItem>
                                    </ListView>
                                </TabPanel>
                                <TabPanel name="global-logistics">
                                    <ListView layout="block">
                                        <Description
                                            withLightText
                                            textSize="sm"
                                        >
                                            {strings.userMenuGlobalLogisticsDescription}
                                        </Description>
                                        <DropdownMenuItem
                                            type="link"
                                            to="globalLogistics"
                                            styleVariant="action"
                                            withoutFullWidth
                                        >
                                            {strings.userMenuSpark}
                                        </DropdownMenuItem>
                                    </ListView>
                                </TabPanel>
                            </Tabs>
                        </DropdownMenu>
                        <DropdownMenu
                            popupClassName={styles.dropdown}
                            label={strings.userMenuRespondLabel}
                            labelColorVariant="text"
                            labelStyleVariant="action"
                            persistent
                            preferredPopupWidth={56}
                        >
                            <Tabs
                                value={activeRespondOption}
                                onChange={setActiveRespondOption}
                                styleVariant="vertical-compact"
                            >
                                <TabList className={styles.optionList}>
                                    <Tab name="emergencies">
                                        {strings.userMenuEmergencies}
                                    </Tab>
                                    <Tab name="early-warning">
                                        {strings.userMenuEarlyWarning}
                                    </Tab>
                                    <Tab name="dref-process">
                                        {strings.userMenuDrefProcess}
                                    </Tab>
                                    <Tab name="surge">
                                        {strings.userMenuSurgeDeployments}
                                    </Tab>
                                </TabList>
                                <div className={styles.optionBorder} />
                                <TabPanel name="emergencies">
                                    <ListView layout="block">
                                        <Description
                                            withLightText
                                            textSize="sm"
                                        >
                                            {strings.userMenuEmergenciesDescription}
                                        </Description>
                                        <DropdownMenuItem
                                            type="link"
                                            to="emergencies"
                                            styleVariant="action"
                                            withoutFullWidth
                                        >
                                            {strings.userMenuOngoingEmergencies}
                                        </DropdownMenuItem>
                                        <ListView
                                            layout="block"
                                            spacing="sm"
                                            withSpacingOpticalCorrection
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="fieldReportFormNew"
                                                colorVariant="primary"
                                                styleVariant="action"
                                                withoutFullWidth
                                            >
                                                {strings.userMenuCreateFieldReport}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                type="link"
                                                to="newThreeWActivity"
                                                colorVariant="primary"
                                                styleVariant="action"
                                                withoutFullWidth
                                            >
                                                {strings.userMenuSubmit3WActivity}
                                            </DropdownMenuItem>
                                        </ListView>
                                    </ListView>
                                </TabPanel>
                                <TabPanel name="early-warning">
                                    <ListView layout="block">
                                        <Description
                                            withLightText
                                            textSize="sm"
                                        >
                                            {strings.userMenuEarlyWarningDescription}
                                        </Description>
                                        <ListView
                                            layout="block"
                                            spacing="sm"
                                            withSpacingOpticalCorrection
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="fieldReportFormNew"
                                                colorVariant="primary"
                                                styleVariant="action"
                                                state={{ earlyWarning: true }}
                                                withoutFullWidth
                                            >
                                                {strings.userMenuCreateEarlyActionFieldReport}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                type="link"
                                                to="flashUpdateFormNew"
                                                colorVariant="primary"
                                                styleVariant="action"
                                                withoutFullWidth
                                            >
                                                {strings.userMenuCreateFlashUpdate}
                                            </DropdownMenuItem>
                                        </ListView>
                                    </ListView>
                                </TabPanel>
                                <TabPanel name="dref-process">
                                    <ListView layout="block">
                                        <Description
                                            withLightText
                                            textSize="sm"
                                        >
                                            {strings.userMenuDrefProcessDescription}
                                        </Description>
                                        <DropdownMenuItem
                                            type="link"
                                            to="accountMyFormsDref"
                                            styleVariant="action"
                                            withoutFullWidth
                                        >
                                            {strings.myDrefApplications}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            type="link"
                                            to="newDrefApplicationForm"
                                            styleVariant="action"
                                            colorVariant="primary"
                                            withoutFullWidth
                                        >
                                            {strings.userMenuCreateDrefApplication}
                                        </DropdownMenuItem>
                                    </ListView>
                                </TabPanel>
                                <TabPanel name="surge">
                                    <ListView layout="block">
                                        <Description
                                            withLightText
                                            textSize="sm"
                                        >
                                            {strings.userMenuSurge}
                                        </Description>
                                        <ListView
                                            layout="block"
                                            withSpacingOpticalCorrection
                                            spacing="sm"
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="activeSurgeDeployments"
                                                styleVariant="action"
                                            >
                                                {strings.userMenuActiveSurgeDeployments}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                type="link"
                                                to="surgeOverviewLayout"
                                                styleVariant="action"
                                            >
                                                {strings.userMenuSurgeGlobalOverview}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                type="link"
                                                to="surgeOperationalToolbox"
                                                styleVariant="action"
                                            >
                                                {strings.userMenuOperationalToolbox}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                type="link"
                                                to="surgeCatalogueLayout"
                                                styleVariant="action"
                                            >
                                                {strings.userMenuCatalogueSurgeServices}
                                            </DropdownMenuItem>
                                        </ListView>
                                    </ListView>
                                </TabPanel>
                            </Tabs>
                        </DropdownMenu>
                        <DropdownMenu
                            popupClassName={styles.dropdown}
                            label={strings.userMenuLearnLabel}
                            labelColorVariant="text"
                            labelStyleVariant="action"
                            persistent
                            preferredPopupWidth={56}
                        >
                            <Tabs
                                value={activeLearnOption}
                                onChange={setActiveLearnOption}
                                styleVariant="vertical-compact"
                            >
                                <TabList className={styles.optionList}>
                                    <Tab name="operational-learning">
                                        {strings.userMenuOperationalLearning}
                                    </Tab>
                                    <Tab name="tools">
                                        {strings.userMenuTools}
                                    </Tab>
                                    <Tab name="resources">
                                        {strings.userMenuResources}
                                    </Tab>
                                    <DropdownMenuItem
                                        external
                                        className={styles.option}
                                        type="link"
                                        href="https://ifrcgoproject.medium.com/"
                                        styleVariant="action"
                                        withLinkIcon
                                        withoutFullWidth
                                    >
                                        {strings.userMenuGoBlog}
                                    </DropdownMenuItem>
                                </TabList>
                                <div className={styles.optionBorder} />
                                <TabPanel name="operational-learning">
                                    <ListView
                                        layout="block"
                                        withSpacingOpticalCorrection
                                        spacing="sm"
                                    >
                                        <DropdownMenuItem
                                            type="link"
                                            to="operationalLearning"
                                            styleVariant="action"
                                            withoutFullWidth
                                        >
                                            {strings.userMenuOperationalLearning}
                                        </DropdownMenuItem>
                                        <Description
                                            textSize="sm"
                                            withLightText
                                        >
                                            {strings.userMenuOperationalLearningDescription}
                                        </Description>
                                    </ListView>
                                </TabPanel>
                                <TabPanel
                                    name="tools"
                                    className={styles.optionDetail}
                                >
                                    <ListView layout="block">
                                        <ListView
                                            layout="block"
                                            withSpacingOpticalCorrection
                                            spacing="sm"
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="surgeOperationalToolbox"
                                                styleVariant="action"
                                                withoutFullWidth
                                            >
                                                {strings.userMenuOperationalToolboxItem}
                                            </DropdownMenuItem>
                                            <Description
                                                textSize="sm"
                                                withLightText
                                            >
                                                {strings.userMenuOperationalToolboxItemDescription}
                                            </Description>
                                        </ListView>
                                        {isTruthyString(sdtUrl) && (
                                            <ListView
                                                layout="block"
                                                withSpacingOpticalCorrection
                                                spacing="sm"
                                            >
                                                <DropdownMenuItem
                                                    type="link"
                                                    external
                                                    href={sdtUrl}
                                                    styleVariant="action"
                                                    withLinkIcon
                                                    withoutFullWidth
                                                >
                                                    {strings.userMenuSurveyDesignToolItem}
                                                </DropdownMenuItem>
                                                <Description
                                                    textSize="sm"
                                                    withLightText
                                                >
                                                    {strings
                                                        .userMenuSurveyDesignToolItemDescription}
                                                </Description>
                                            </ListView>
                                        )}
                                    </ListView>
                                </TabPanel>
                                <TabPanel
                                    name="resources"
                                    className={styles.optionDetail}
                                >
                                    <ListView layout="block">
                                        <ListView
                                            layout="block"
                                            withSpacingOpticalCorrection
                                            spacing="sm"
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="montandonLandingPage"
                                                styleVariant="action"
                                                state={{ earlyWarning: true }}
                                                withoutFullWidth
                                            >
                                                {strings.userMenuMontandonItem}
                                            </DropdownMenuItem>
                                            <Description
                                                withLightText
                                                textSize="sm"
                                            >
                                                {strings.userMenuMontandonItemDescription}
                                            </Description>
                                        </ListView>
                                        <ListView
                                            layout="block"
                                            withSpacingOpticalCorrection
                                            spacing="sm"
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="surgeCatalogueLayout"
                                                styleVariant="action"
                                                state={{ earlyWarning: true }}
                                                withoutFullWidth
                                            >
                                                {strings.userMenuCatalogueSurgeServicesItem}
                                            </DropdownMenuItem>
                                            <Description
                                                withLightText
                                                textSize="sm"
                                            >
                                                {strings
                                                    .userMenuCatalogueSurgeServicesItemDescription}
                                            </Description>
                                        </ListView>
                                        <ListView
                                            layout="block"
                                            withSpacingOpticalCorrection
                                            spacing="sm"
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="preparednessGlobalCatalogue"
                                                styleVariant="action"
                                                state={{ earlyWarning: true }}
                                                withoutFullWidth
                                            >
                                                {strings.userMenuPERCatalogueItem}
                                            </DropdownMenuItem>
                                            <Description
                                                withLightText
                                                textSize="sm"
                                            >
                                                {strings.userMenuPERCatalogueItemDescription}
                                            </Description>
                                        </ListView>
                                        <ListView
                                            layout="block"
                                            withSpacingOpticalCorrection
                                            spacing="sm"
                                        >
                                            <DropdownMenuItem
                                                type="link"
                                                to="resources"
                                                styleVariant="action"
                                                state={{ earlyWarning: true }}
                                                withoutFullWidth
                                            >
                                                {strings.userMenuGoResourcesItem}
                                            </DropdownMenuItem>
                                            <Description
                                                withLightText
                                                textSize="sm"
                                            >
                                                {strings.userMenuGoResourcesItemDescription}
                                            </Description>
                                        </ListView>
                                    </ListView>
                                </TabPanel>
                            </Tabs>
                        </DropdownMenu>
                    </NavigationTabList>
                    <div className={styles.searchContainer}>
                        <KeywordSearchSelectInput />
                    </div>
                </ListView>
            </PageContainer>
        </nav>
    );
}

export default Navbar;
