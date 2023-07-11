import { useOutletContext } from 'react-router-dom';
import useTranslation from '#hooks/useTranslation';

import KeyFigure from '#components/KeyFigure';
import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import type { EmergencyOutletContext } from '#utils/emergency';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();

    return (
        <div className={styles.emergencyDetails}>
            {emergencyResponse?.key_figures && emergencyResponse?.key_figures.length > 0 && (
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
        </div>
    );
}

Component.displayName = 'EmergencyDetails';
