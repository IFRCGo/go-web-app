import { useTranslation } from '@ifrc-go/ui/hooks';
import PERSummaryDashboard from '../PERDashboard/PERSummaryDashboard';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <div className={styles.preparednessGlobalSummary}>
            <PERSummaryDashboard />
        </div>
    );
}

Component.displayName = 'PreparednessGlobalSummary';
