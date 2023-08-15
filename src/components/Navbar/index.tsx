import { useCallback, useContext } from 'react';
import { useNavigate, generatePath } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { SearchLineIcon } from '@ifrc-go/icons';

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
import RouteContext from '#contexts/route';
import UserContext from '#contexts/user';
import goLogo from '#assets/icons/go-logo-2020.svg';

import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    const {
        home: homeRoute,
        resources: resourcesRoute,
        login: loginRoute,
        register: registerRoute,
        emergencies: emergenciesRoute,
        surge: surgeRoute,
        preparedness: preparednessRoute,
        globalThreeW: globalThreeWRoute,
        search: searchRoute,
        newThreeWActivity: newThreeWActivityFromRoute,
        newDrefApplicationForm: newDrefApplicationFormRoute,
        fieldReportFormNew: fieldReportFormNewRoute,
    } = useContext(RouteContext);

    const { userAuth: userDetails } = useContext(UserContext);
    const strings = useTranslation(i18n);
    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);

    const navigate = useNavigate();
    const handleSearchInputEnter = useCallback(() => {
        if ((searchText?.trim()?.length ?? 0) > 2) {
            navigate(
                generatePath(
                    searchRoute.absolutePath,
                    { searchText },
                ),
            );
        }
    }, [
        searchText,
        navigate,
        searchRoute.absolutePath,
    ]);

    return (
        <nav className={_cs(styles.navbar, className)}>
            <PageContainer
                className={styles.top}
                contentClassName={styles.topContent}
            >
                <Link
                    to={homeRoute.absolutePath}
                    className={styles.brand}
                >
                    <img
                        className={styles.goIcon}
                        src={goLogo}
                        alt={strings.headerLogoAltText}
                    />
                </Link>
                <NavigationTabList
                    className={styles.actions}
                    variant="tertiary"
                >
                    <NavigationTab
                        to={resourcesRoute.absolutePath}
                        className={styles.actionItem}
                    >
                        {strings.headerMenuResources}
                    </NavigationTab>
                    {!userDetails && (
                        <>
                            <NavigationTab
                                to={loginRoute.absolutePath}
                                className={styles.actionItem}
                            >
                                {strings.userMenuLogin}
                            </NavigationTab>
                            <NavigationTab
                                to={registerRoute.absolutePath}
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
                            to={fieldReportFormNewRoute.absolutePath}
                        >
                            {strings.headerDropdownNewFieldReport}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            to={newThreeWActivityFromRoute.absolutePath}
                        >
                            {strings.headerDropdownNew3WActivity}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            to={newDrefApplicationFormRoute.absolutePath}
                        >
                            {strings.headerDropdownNewDrefApplication}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            to="/"
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
                            to={homeRoute.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuHomeTooltip}
                            parentRoute
                        >
                            {strings.headerMenuHome}
                        </NavigationTab>
                        <RegionDropdown />
                        <NavigationTab
                            to={emergenciesRoute.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuEmergenciesTooltip}
                            parentRoute
                        >
                            {strings.headerMenuEmergencies}
                        </NavigationTab>
                        <NavigationTab
                            to={surgeRoute.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuSurgeTooltip}
                            parentRoute
                        >
                            {strings.headerMenuSurge}
                        </NavigationTab>
                        <NavigationTab
                            to={preparednessRoute.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuPreparednessTooltip}
                            parentRoute
                        >
                            {strings.headerMenuPreparedness}
                        </NavigationTab>
                        <NavigationTab
                            to={globalThreeWRoute.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuThreeWTooltip}
                            parentRoute
                        >
                            {strings.headerMenuThreeW}
                        </NavigationTab>
                    </NavigationTabList>
                    <div className={styles.searchContainer}>
                        <TextInput
                            placeholder="Search"
                            value={searchText}
                            name={undefined}
                            onChange={setSearchText}
                            icons={<SearchLineIcon />}
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
