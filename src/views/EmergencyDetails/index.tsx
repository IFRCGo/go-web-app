import { useOutletContext } from 'react-router-dom';
import useTranslation from '#hooks/useTranslation';

import UnderConstructionMessage from '#components/UnderConstructionMessage';
import KeyFigure from '#components/KeyFigure';
import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import type { EmergencyOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();

    const hasKeyFigures = emergencyResponse && emergencyResponse.key_figures.length !== 0;

    return (
        <div className={styles.emergencyDetails}>
            {hasKeyFigures && (
                <Container
                    heading={strings.emergencyKeyFiguresTitle}
                    childrenContainerClassName={styles.keyFigureList}
                    withHeaderBorder
                >
                    {emergencyResponse?.key_figures.map(
                        (keyFigure) => (
                            <KeyFigure
                                key={keyFigure.id}
                                className={styles.keyFigure}
                                // FIXME: get numeric value from server
                                value={Number.parseFloat(keyFigure.number)}
                                description={keyFigure.deck}
                            >
                                <TextOutput
                                    label={strings.emergencyKeyFigureSource}
                                    value={keyFigure.source}
                                />
                            </KeyFigure>
                        ),
                    )}
                </Container>
            )}
            {!hasKeyFigures && (
                <UnderConstructionMessage
                    title="Emergency Details"
                />
            )}
        </div>
    );
}

Component.displayName = 'EmergencyDetails';
