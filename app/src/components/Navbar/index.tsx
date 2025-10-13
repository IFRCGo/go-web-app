import {
    ButtonLayout,
    Description,
    DropdownMenu,
    ListView,
    NavigationTabList,
    PageContainer,
    Tab,
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
import NavDropdownMenu from './NavDropdownMenu';
import NavDropdownTabDetails from './NavDropdownTabDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface MenuItemWithDescriptionProps {
    description: React.ReactNode;
    children: React.ReactNode;
}
function MenuItemWithDescription(props: MenuItemWithDescriptionProps) {
    const {
        description,
        children,
    } = props;

    return (
        <ListView
            layout="block"
            withSpacingOpticalCorrection
            spacing="2xs"
        >
            {children}
            <Description
                textSize="xs"
            >
                {description}
            </Description>
        </ListView>
    );
}

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    const { isAuthenticated } = useAuth();
    const strings = useTranslation(i18n);

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
                            <ButtonLayout
                                // FIXME: use appropriate component
                                readOnly
                                colorVariant="secondary"
                                styleVariant="filled"
                                spacing="4xs"
                                textSize="xs"
                            >
                                {environment}
                            </ButtonLayout>
                        )}
                    </div>
                    <NavigationTabList styleVariant="nav">
                        <LanguageDropdown />
                        {!isAuthenticated && (
                            <>
                                <NavigationTab to="login">
                                    {strings.userMenuLogin}
                                </NavigationTab>
                                <NavigationTab to="register">
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
            <PageContainer contentClassName={styles.bottomContent}>
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
                        <NavDropdownMenu
                            label={strings.userMenuPrepare}
                            initialValue="risk-analysis"
                            tabs={(
                                <>
                                    <Tab name="risk-analysis">
                                        {strings.userMenuRiskAnalysisLabel}
                                    </Tab>
                                    <Tab name="per">
                                        {strings.userMenuPERLabel}
                                    </Tab>
                                    <Tab name="global-logistics">
                                        {strings.userMenuGlobalLogistics}
                                    </Tab>
                                </>
                            )}
                        >
                            <NavDropdownTabDetails
                                name="risk-analysis"
                                description={strings.userMenuGlobalRiskDescription}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="riskWatchLayout"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.headerMenuRiskWatch}
                                </DropdownMenuItem>
                            </NavDropdownTabDetails>
                            <NavDropdownTabDetails
                                name="per"
                                description={strings.userMenuPERDescription}
                                footer={(
                                    <DropdownMenuItem
                                        type="link"
                                        to="perProcessLayout"
                                        colorVariant="primary"
                                        styleVariant="action"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuStartPER}
                                    </DropdownMenuItem>
                                )}
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
                            </NavDropdownTabDetails>
                            <NavDropdownTabDetails
                                name="global-logistics"
                                description={strings.userMenuGlobalLogisticsDescription}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="globalLogistics"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.userMenuSpark}
                                </DropdownMenuItem>
                            </NavDropdownTabDetails>
                        </NavDropdownMenu>
                        <NavDropdownMenu
                            label={strings.userMenuRespondLabel}
                            initialValue="emergencies"
                            tabs={(
                                <>
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
                                </>
                            )}
                        >
                            <NavDropdownTabDetails
                                name="emergencies"
                                description={strings.userMenuEmergenciesDescription}
                                footer={(
                                    <>
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
                                    </>
                                )}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="emergencies"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.userMenuOngoingEmergencies}
                                </DropdownMenuItem>
                            </NavDropdownTabDetails>
                            <NavDropdownTabDetails
                                name="early-warning"
                                description={strings.userMenuEarlyWarningDescription}
                                footer={(
                                    <>
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
                                    </>
                                )}
                            />
                            <NavDropdownTabDetails
                                name="dref-process"
                                description={strings.userMenuDrefProcessDescription}
                                footer={(
                                    <DropdownMenuItem
                                        type="link"
                                        to="newDrefApplicationForm"
                                        styleVariant="action"
                                        colorVariant="primary"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuCreateDrefApplication}
                                    </DropdownMenuItem>
                                )}
                            >
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
                                    to="accountMyFormsEap"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.earlyActionProtocols}
                                </DropdownMenuItem>
                            </NavDropdownTabDetails>
                            <NavDropdownTabDetails
                                name="surge"
                                description={strings.userMenuSurge}
                            >
                                <DropdownMenuItem
                                    type="link"
                                    to="activeSurgeDeployments"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.userMenuActiveSurgeDeployments}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOverviewLayout"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.userMenuSurgeGlobalOverview}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeOperationalToolbox"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.userMenuOperationalToolbox}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    type="link"
                                    to="surgeCatalogueLayout"
                                    styleVariant="action"
                                    withoutFullWidth
                                >
                                    {strings.userMenuCatalogueSurgeServices}
                                </DropdownMenuItem>
                            </NavDropdownTabDetails>
                        </NavDropdownMenu>
                        <NavDropdownMenu
                            label={strings.userMenuLearnLabel}
                            initialValue="operational-learning"
                            tabs={(
                                <>
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
                                        styleVariant="filled"
                                        colorVariant="primary"
                                        spacing="sm"
                                        withLinkIcon
                                        withoutFullWidth
                                    >
                                        {strings.userMenuGoBlog}
                                    </DropdownMenuItem>
                                </>
                            )}
                        >
                            <NavDropdownTabDetails name="operational-learning">
                                <MenuItemWithDescription
                                    description={strings.userMenuOperationalLearningDescription}
                                >
                                    <DropdownMenuItem
                                        type="link"
                                        to="operationalLearning"
                                        styleVariant="action"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuOperationalLearning}
                                    </DropdownMenuItem>
                                </MenuItemWithDescription>
                            </NavDropdownTabDetails>
                            <NavDropdownTabDetails name="tools">
                                <MenuItemWithDescription
                                    description={strings.userMenuOperationalToolboxItemDescription}
                                >
                                    <DropdownMenuItem
                                        type="link"
                                        to="surgeOperationalToolbox"
                                        styleVariant="action"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuOperationalToolboxItem}
                                    </DropdownMenuItem>
                                </MenuItemWithDescription>
                                {isTruthyString(sdtUrl) && (
                                    <MenuItemWithDescription
                                        description={strings
                                            .userMenuSurveyDesignToolItemDescription}
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
                                    </MenuItemWithDescription>
                                )}
                            </NavDropdownTabDetails>
                            <NavDropdownTabDetails name="resources">
                                <MenuItemWithDescription
                                    description={strings.userMenuMontandonItemDescription}
                                >
                                    <DropdownMenuItem
                                        type="link"
                                        to="montandonLandingPage"
                                        styleVariant="action"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuMontandonItem}
                                    </DropdownMenuItem>
                                </MenuItemWithDescription>
                                <MenuItemWithDescription
                                    description={strings
                                        .userMenuCatalogueSurgeServicesItemDescription}
                                >
                                    <DropdownMenuItem
                                        type="link"
                                        to="surgeCatalogueLayout"
                                        styleVariant="action"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuCatalogueSurgeServicesItem}
                                    </DropdownMenuItem>
                                </MenuItemWithDescription>
                                <MenuItemWithDescription
                                    description={strings.userMenuPERCatalogueItemDescription}
                                >
                                    <DropdownMenuItem
                                        type="link"
                                        to="preparednessGlobalCatalogue"
                                        styleVariant="action"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuPERCatalogueItem}
                                    </DropdownMenuItem>
                                </MenuItemWithDescription>
                                <MenuItemWithDescription
                                    description={strings.userMenuGoResourcesItemDescription}
                                >
                                    <DropdownMenuItem
                                        type="link"
                                        to="resources"
                                        styleVariant="action"
                                        withoutFullWidth
                                    >
                                        {strings.userMenuGoResourcesItem}
                                    </DropdownMenuItem>
                                </MenuItemWithDescription>
                            </NavDropdownTabDetails>
                        </NavDropdownMenu>
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
