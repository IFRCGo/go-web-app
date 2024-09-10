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
                <div className={styles.fourHundredFourHeading}>
                    404
                </div>

                <Heading
                    level={1}
                    className={styles.heading}
                >
                    {strings.uhohOops}
                </Heading>
                <div className={styles.description}>
                    {strings.uhohPageDescription1}
                </div>
                <div className={styles.description}>
                    {strings.uhohPageDescription2}
                </div>
            </div>
            <div className={styles.bottomSection}>
                <Link
                    to="home"
                    variant="primary"
                >
                    {strings.uhohBackToHome}
                </Link>
            </div>
        </Page>
    );
}

Component.displayName = 'FourHundredFour';
