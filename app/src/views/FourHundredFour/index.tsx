import { Heading } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import fourHundredFour from '#assets/content/four_hundred_four.svg';
import fourHundredFourBackgroundImage from '#assets/content/four_hundred_four_background.svg';
import Link from '#components/Link';
import Page from '#components/Page';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.uhohPageNotFoundTitle}
            mainSectionClassName={styles.main}
            mainSectionContainerClassName={styles.mainContainer}
        >
            <div className={styles.backgroundLayer}>
                <img
                    className={styles.image}
                    src={fourHundredFourBackgroundImage}
                    alt={strings.fourHundredFourBackgroundImage}
                />
            </div>
            <div className={styles.fourHundredFourHeading}>
                <img
                    className={styles.image}
                    src={fourHundredFour}
                    alt={strings.fourHundredFour}
                />
            </div>
            <div className={styles.content}>
                <Heading
                    level={1}
                >
                    {strings.uhohOops}
                </Heading>
                <div className={styles.description}>
                    {strings.uhohPageDescriptionOne}
                </div>
                <div className={styles.description}>
                    {strings.uhohPageDescriptionTwo}
                </div>
            </div>
            <Link
                to="home"
                variant="primary"
            >
                {strings.uhohBackToHome}
            </Link>
        </Page>
    );
}

Component.displayName = 'FourHundredFour';
