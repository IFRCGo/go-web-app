import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiMDQ5YzBlODItOTQ3Yy00Y2Q2LWFjZmEtZWIxMTAwZjkxZGU2IiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9';

    return (
        <div className={styles.preparednessGlobalPerformance}>
            <iframe
                title={strings.globalPerformanceTitle}
                className={styles.performanceIframe}
                src={url}
            />
        </div>
    );
}

Component.displayName = 'PreparednessGlobalPerformance';
