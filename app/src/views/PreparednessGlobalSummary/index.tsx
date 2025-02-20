import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiMTExYTlmZDMtMTNkZi00MmY5LTkyYTYtNTczZGU0MmQxYjE3IiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9';

    return (
        <div className={styles.preparednessGlobalSummary}>
            <iframe
                title={strings.globalSummaryTitle}
                className={styles.summaryIframe}
                src={url}
            />
        </div>
    );
}

Component.displayName = 'PreparednessGlobalSummary';
