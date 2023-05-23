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
                variant="success"
                name="Success"
            >
                This is alert for Success message
            </Alert>
            <Heading level={5}>
                Danger alert example
            </Heading>
            <Alert
                variant="danger"
                name="Danger"
                debugMessage="Danger message"
            >
                This is alert for Danger message
            </Alert>
            <Heading level={5}>
                Info alert example
            </Heading>
            <Alert
                variant="info"
                name="Info"
            >
                This is alert for Info message
            </Alert>
            <Heading level={5}>
                Warning alert example
            </Heading>
            <Alert
                variant="warning"
                name="Waring"
            >
                This is alert for Warning message
            </Alert>
        </div>
    );
}

export default Alerts;
