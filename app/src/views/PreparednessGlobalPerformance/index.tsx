import PERPerformanceDashboard from '../PERDashboard/PERPerformanceDashboard';

import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <div className={styles.preparednessGlobalPerformance}>
            <PERPerformanceDashboard />
        </div>
    );
}

Component.displayName = 'PreparednessGlobalPerformance';
