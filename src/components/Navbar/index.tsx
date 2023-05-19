import { _cs } from '@togglecorp/fujs';

import PageContainer from '#components/PageContainer';
import Link from '#components/Link';
import TextInput from '#components/TextInput';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import goLogo from '#assets/icons/go-logo-2020.svg';
import commonStrings from '#strings/common';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import routes from '#routes';

import styles from './styles.module.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation('common', commonStrings);
    const [searchText, setSearchText] = useInputState<string | undefined>(undefined);

    return (
        <nav className={_cs(styles.navbar, className)}>
            <PageContainer
                className={styles.top}
                contentClassName={styles.topContent}
            >
                <Link
                    to={routes.home.absolutePath}
                    className={styles.brand}
                >
                    <img
                        className={styles.goIcon}
                        src={goLogo}
                        alt={strings.headerLogoAltText}
                    />
                </Link>
                <div className={styles.actions}>
                    <Link
                        to={routes.resources.absolutePath}
                        className={styles.actionItem}
                    >
                        {strings.headerMenuResources}
                    </Link>
                    <Link
                        to={routes.login.absolutePath}
                        className={styles.actionItem}
                    >
                        {strings.userMenuLogin}
                    </Link>
                    <Link
                        to={routes.register.absolutePath}
                        className={styles.actionItem}
                    >
                        {strings.userMenuRegister}
                    </Link>
                    <DropdownMenu
                        label={strings.headerCreateAReportLabel}
                    >
                        <DropdownMenuItem
                            label="New Field Report"
                        />
                        <DropdownMenuItem
                            label="COVID-19 Indicator Tracking"
                        />
                        <DropdownMenuItem
                            label="COVID-19 NS Financial Overview"
                        />
                        <DropdownMenuItem
                            label="New 3W Activity"
                        />
                        <DropdownMenuItem
                            label="New DREF Application"
                        />
                        <DropdownMenuItem
                            label="New Flash Update"
                        />
                    </DropdownMenu>
                </div>
            </PageContainer>
            <PageContainer>
                <div className={styles.bottom}>
                    <div className={styles.menuItems}>
                        <Link
                            to={routes.home.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuHomeTooltip}
                        >
                            {strings.headerMenuHome}
                        </Link>
                        <div
                            className={styles.menuItem}
                            title={strings.menuRegionsTooltip}
                        >
                            {strings.menuRegions}
                        </div>
                        <Link
                            to={routes.emergencies.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuEmergenciesTooltip}
                        >
                            {strings.headerMenuEmergencies}
                        </Link>
                        <Link
                            to={routes.surge.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuSurgeTooltip}
                        >
                            {strings.headerMenuSurge}
                        </Link>
                        <Link
                            to={routes.preparedness.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuPreparednessTooltip}
                        >
                            {strings.headerMenuPreparedness}
                        </Link>
                        <Link
                            to={routes.threeW.absolutePath}
                            className={styles.menuItem}
                            title={strings.headerMenuThreeWTooltip}
                        >
                            {strings.headerMenuThreeW}
                        </Link>
                    </div>
                    <div className={styles.searchContainer}>
                        <TextInput
                            placeholder="Search"
                            value={searchText}
                            name={undefined}
                            onChange={setSearchText}
                        />
                    </div>
                </div>
            </PageContainer>
        </nav>
    );
}

export default Navbar;
