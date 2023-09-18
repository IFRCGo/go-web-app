import { useContext } from 'react';
import { isNotDefined, _cs } from '@togglecorp/fujs';

import PageContainer from '#components/PageContainer';
import Link from '#components/Link';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import RegionDropdown from '#components/domain/RegionDropdown';
import KeywordSearchSelectInput from '#components/domain/KeywordSearchSelectInput';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';
import { environment } from '#config';
import goLogo from '#assets/icons/go-logo-2020.svg';

import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
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

    const { userAuth: userDetails } = useContext(UserContext);
    const strings = useTranslation(i18n);

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
                    <NavigationTab
                        to="resources"
                        className={styles.actionItem}
                    >
                        {strings.headerMenuResources}
                    </NavigationTab>
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
                        title={strings.headerMenuHomeTooltip}
                    >
                        {strings.headerMenuHome}
                    </NavigationTab>
                    <RegionDropdown />
                    <NavigationTab
                        to="emergencies"
                        className={styles.menuItem}
                        title={strings.headerMenuEmergenciesTooltip}
                        parentRoute
                    >
                        {strings.headerMenuEmergencies}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeLayout"
                        className={styles.menuItem}
                        title={strings.headerMenuSurgeTooltip}
                        parentRoute
                    >
                        {strings.headerMenuSurge}
                    </NavigationTab>
                    <NavigationTab
                        to="preparednessLayout"
                        className={styles.menuItem}
                        title={strings.headerMenuPreparednessTooltip}
                        parentRoute
                    >
                        {strings.headerMenuPreparedness}
                    </NavigationTab>
                    <NavigationTab
                        to="globalThreeW"
                        className={styles.menuItem}
                        title={strings.headerMenuThreeWTooltip}
                        parentRoute
                    >
                        {strings.headerMenuThreeW}
                    </NavigationTab>
                    <NavigationTab
                        to="riskWatchLayout"
                        className={styles.menuItem}
                        title={strings.headerMenuThreeWTooltip}
                        parentRoute
                    >
                        {strings.headerMenuRiskWatch}
                    </NavigationTab>
                </NavigationTabList>
                <div className={styles.searchContainer}>
                    <KeywordSearchSelectInput />
                </div>
            </PageContainer>
        </nav>
    );
}

export default Navbar;
