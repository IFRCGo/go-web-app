import { SearchLineIcon } from '@ifrc-go/icons';

import Page from '#components/Page';
import Heading from '#components/Heading';
import useTranslation from '#hooks/useTranslation';
import Link from '#components/Link';

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
                            403
                        </Heading>
                    </div>
                    {strings.permissionDenied}
                </Heading>
                <div className={styles.description}>
                    {strings.pageDescription}
                </div>
            </div>
            <div className={styles.bottomSection}>
                {strings.areYouSureUrlIsCorrect}
                <div className={styles.text}>
                    <Link
                        href="mailto:im@ifrc.org"
                        external
                    >
                        {strings.getInTouch}
                    </Link>
                    &nbsp;
                    {strings.withThePlatformTeam}
                </div>
                <Link
                    to="home"
                    variant="primary"
                >
                    {strings.exploreOurHomepage}
                </Link>
            </div>
        </Page>
    );
}

export default FourHundredThree;
