import { useOutletContext } from 'react-router-dom';
import type { RegionOutletContext } from '#utils/outletContext';
import HtmlOutput from '#components/HtmlOutput';
import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import i18n from './i18n.json';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { regionResponse, regionKeyFigureResponse } = useOutletContext<RegionOutletContext>();
    const hasKeyFigure = (regionKeyFigureResponse?.results
        && (regionKeyFigureResponse.results.length > 0));
    const hasRegionResponse = regionResponse
        && regionResponse?.snippets;

    return (
        <div className={styles.regionPreparedness}>
            {hasKeyFigure && (
                <Container
                    heading={strings.keyFigureHeading}
                    withHeaderBorder
                    childrenContainerClassName={styles.keyFigureList}
                >
                    {regionKeyFigureResponse?.results?.map((figure) => (
                        <KeyFigure
                            // NOTE we should maintain key figures to take value as strings
                            // NOTE also design may vary from original we need to fix that too
                            key={figure.id}
                            className={styles.regionKeyFigure}
                            value={Number.parseFloat(figure.figure)}
                            description={figure.deck}
                        >
                            <TextOutput
                                value={figure.source}
                                label={strings.keyFigureLabel}
                            />
                        </KeyFigure>
                    ))}
                </Container>
            )}
            {hasRegionResponse && (
                <Container
                    heading={strings.containerTitle}
                    withHeaderBorder
                >
                    {regionResponse.snippets.map(
                        (snippet) => (
                            <HtmlOutput
                                className={styles.regionalContent}
                                key={snippet.id}
                                value={snippet.snippet}
                            />
                        ),
                    )}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'RegionAdditionalInfo';
