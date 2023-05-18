import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import homePageStrings from '#strings/home';
import HighlightedOperations from './HighlightedOperations';
import ActiveOperationMap from './ActiveOperationMap';

import styles from './styles.module.css';

export function Component() {
    const strings = useTranslation('home', homePageStrings);

    return (
        <Page
            title={strings.homeTitle}
            className={styles.home}
            heading={strings.homeHeading}
            description={strings.homeDescription}
            mainSectionClassName={styles.content}
        >
            <HighlightedOperations />
            <ActiveOperationMap />
        </Page>
    );
}
