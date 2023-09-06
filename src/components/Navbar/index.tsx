import { useCallback, useContext } from 'react';
import { isNotDefined, _cs } from '@togglecorp/fujs';
import { SearchLineIcon } from '@ifrc-go/icons';

import useRouting from '#hooks/useRouting';
import PageContainer from '#components/PageContainer';
import Link from '#components/Link';
import TextInput from '#components/TextInput';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import RegionDropdown from '#components/domain/RegionDropdown';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import { KEY_URL_SEARCH, SEARCH_TEXT_LENGTH_MIN } from '#utils/constants';
import UserContext from '#contexts/user';
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
    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);

    const { navigate } = useRouting();

    const handleSearchInputEnter = useCallback(() => {
        const searchStringSafe = searchText?.trim() ?? '';
        if (searchStringSafe.length >= SEARCH_TEXT_LENGTH_MIN) {
            setSearchText(undefined);
            navigate(
                'search',
                {
                    search: `${KEY_URL_SEARCH}=${searchText}`,
                },
            );
        }
    }, [
        searchText,
        setSearchText,
        navigate,
    ]);

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
            <PageContainer>
                <div className={styles.bottom}>
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
                        <TextInput
                            placeholder="Search"
                            value={searchText}
                            name={undefined}
                            onChange={setSearchText}
                            icons={<SearchLineIcon />}
                            // FIXME: do not inline functions
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearchInputEnter();
                                }
                            }}
                        />
                    </div>
                </div>
            </PageContainer>
        </nav>
    );
}

export default Navbar;
