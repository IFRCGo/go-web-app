import React from 'react';

import Page from '#components/Page';
import HighlightedOperations from './HighlightedOperations';

import strings from './strings';
import styles from './styles.module.css';

export function Component() {
    return (
        <Page
            title={strings.pageTitle}
            className={styles.home}
            heading={strings.pageHeading}
            description={strings.pageDescription}
        >
            <HighlightedOperations />
        </Page>
    );
}
