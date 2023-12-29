import { SearchLineIcon } from '@ifrc-go/icons';
import { Heading } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';
import Page from '#components/Page';

import i18n from './i18n.json';
import styles from './styles.module.css';

function FourHundredThree() {
    const strings = useTranslation(i18n);

    return (
        <Page
            className={styles.fourHundredThree}
            title={strings.permissionDeniedPageTitle}
            mainSectionContainerClassName={styles.mainSectionContainer}
            mainSectionClassName={styles.main}
        >
            <div className={styles.topSection}>
                <Heading
                    level={1}
                    className={styles.heading}
                >
                    <div className={styles.icons}>
                        <SearchLineIcon className={styles.searchIcon} />
                        <Heading
                            level={2}
                        >
                            {strings.permissionHeadingLabel}
                        </Heading>
                    </div>
                    {strings.permissionDeniedHeading}
                </Heading>
                <div className={styles.description}>
                    {strings.permissionDeniedPageDescription}
                </div>
            </div>
            <div className={styles.bottomSection}>
                {strings.permissionDeniedAreYouSureUrlIsCorrect}
                <div className={styles.text}>
                    <Link
                        href="mailto:im@ifrc.org"
                        external
                    >
                        {strings.permissionDeniedGetInTouch}
                    </Link>
                    &nbsp;
                    {strings.permissionDeniedWithThePlatformTeam}
                </div>
                <Link
                    to="home"
                    variant="primary"
                >
                    {strings.permissionDeniedExploreOurHomepage}
                </Link>
            </div>
        </Page>
    );
}

export default FourHundredThree;
