import { SearchLineIcon } from '@ifrc-go/icons';
import { Heading } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';
import Page from '#components/Page';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            className={styles.fourHundredFour}
            title={strings.uhohPageNotFoundTitle}
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
                            404
                        </Heading>
                    </div>
                    {strings.uhohPageNotFound}
                </Heading>
                <div className={styles.description}>
                    {strings.uhohPageDescription}
                </div>
            </div>
            <div className={styles.bottomSection}>
                {strings.uhohAreYouSureUrlIsCorrect}
                <div className={styles.text}>
                    <Link
                        href="mailto:im@ifrc.org"
                        external
                    >
                        {strings.uhohGetInTouch}
                    </Link>
                    &nbsp;
                    {strings.uhohWithThePlatformTeam}
                </div>
                <Link
                    to="home"
                    variant="primary"
                >
                    {strings.uhohExploreOurHomepage}
                </Link>
            </div>
        </Page>
    );
}

Component.displayName = 'FourHundredFour';
