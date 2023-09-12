import { useOutletContext } from 'react-router-dom';
import { type EmergencyOutletContext } from '#utils/outletContext';
import HtmlOutput from '#components/HtmlOutput';

import styles from './styles.module.css';

interface Props {
    infoPageId: number;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const { infoPageId } = props;
    const { emergencyAdditionalTabs } = useOutletContext<EmergencyOutletContext>();

    const additionalTab = emergencyAdditionalTabs?.find(
        (tab) => tab.infoPageId === infoPageId,
    );
    return (
        <div
            className={styles.additionalTab}
        >
            {additionalTab?.snippets?.map((snippet) => (
                <HtmlOutput
                    key={snippet.id}
                    value={snippet.snippet}
                    className={styles.additionalContent}
                />
            ))}
        </div>
    );
}

Component.displayName = 'EmergencyAdditionalTab';
