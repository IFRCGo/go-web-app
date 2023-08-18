import { useOutletContext } from 'react-router-dom';
import type { RegionOutletContext } from '#utils/outletContext';
import HtmlOutput from '#components/HtmlOutput';
import Container from '#components/Container';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    return (
        <div className={styles.regionPreparedness}>
            {regionResponse?.preparedness_snippets.map(
                (snippet) => (
                    <Container
                        key={snippet.id}
                        heading={snippet.title}
                        withHeaderBorder
                    >
                        <HtmlOutput
                            value={snippet.snippet}
                        />
                    </Container>
                ),
            )}
        </div>
    );
}

Component.displayName = 'RegionPreparedness';
