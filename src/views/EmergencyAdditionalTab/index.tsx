import { useOutletContext, useParams } from 'react-router-dom';
import { type EmergencyOutletContext } from '#utils/outletContext';
import HtmlOutput from '#components/HtmlOutput';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { routeName } = useParams<{ routeName: string }>();
    const { emergencyAdditionalTabs } = useOutletContext<EmergencyOutletContext>();

    const additionalTab = emergencyAdditionalTabs?.find((tab) => tab.routeName === routeName);
    return (
        <div
            className={styles.additionalTab}
        >
            {additionalTab?.snippets?.map((sanitize) => (
                <HtmlOutput
                    value={sanitize.snippet}
                    className={styles.additionalContent}
                />
            ))}
        </div>
    );
}

Component.displayName = 'EmergencyAdditionalTab';
