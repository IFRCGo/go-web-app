import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const url = ' https://matthewsmawfield.github.io/per-dashboard/#/performance';

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
