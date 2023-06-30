import Heading from '#components/Heading';
import Alert from '#components/Alert';

import styles from './styles.module.css';

function Alerts() {
    return (
        <div className={styles.alertCollection}>
            <Heading level={4}>
                ALERT COLLECTION
            </Heading>
            <Heading level={5}>
                Success alert example
            </Heading>
            <Alert
                nonDismissable
                type="success"
                name="success"
                title="This is alert for Success message"
                description="This is the description for the alert. If we have longer message in the alert we can use the description field"
            />
            <Heading level={5}>
                Danger alert example
            </Heading>
            <Alert
                type="danger"
                name="Danger"
                debugMessage="Danger message"
                title="This is alert for Danger message"
            />
            <Heading level={5}>
                Info alert example
            </Heading>
            <Alert
                type="info"
                name="Info"
                title="This is alert for Info message"
            />
            <Heading level={5}>
                Warning alert example
            </Heading>
            <Alert
                type="warning"
                name="Waring"
                title="This is alert for Warning message"
            />
        </div>
    );
}

export default Alerts;
