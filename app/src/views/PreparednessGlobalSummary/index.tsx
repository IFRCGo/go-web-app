import PERSummaryDashboard from '../PERDashboard/PERSummaryDashboard';

import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <div className={styles.preparednessGlobalSummary}>
            <PERSummaryDashboard />
        </div>
    );
}

Component.displayName = 'PreparednessGlobalSummary';
