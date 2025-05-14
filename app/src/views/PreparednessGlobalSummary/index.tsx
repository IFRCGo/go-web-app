import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const url = 'https://matthewsmawfield.github.io/per-dashboard/#/summary';

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
