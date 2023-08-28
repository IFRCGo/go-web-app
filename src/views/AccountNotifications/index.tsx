import SubmittedFieldReports from './SubmittedFieldReports';
import SubscriptionPreferences from './SubscriptionPreferences';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    // const userMe = useUserMe();

    return (
        <div className={styles.accountNotifications}>
            <SubmittedFieldReports />
            <SubscriptionPreferences />
        </div>
    );
}

Component.displayName = 'AccountNotifications';
