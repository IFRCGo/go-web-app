import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    HtmlOutput,
    List,
} from '@ifrc-go/ui';

import {
    type RegionOutletContext,
    type RegionResponse,
} from '#utils/outletContext';

import styles from './styles.module.css';

type RegionSnippet = NonNullable<RegionResponse['preparedness_snippets']>[number];

const keySelector = (d: RegionSnippet) => d.id;

interface SnippetProps {
    id: number;
    title: string | null | undefined;
    snippet: string | null | undefined;
}

function Snippet(props: SnippetProps) {
    const {
        id,
        title,
        snippet,
    } = props;

    return (
        <Container
            key={id}
            heading={title}
            withHeaderBorder
        >
            <HtmlOutput
                value={snippet}
            />
        </Container>
    );
}
/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    const snippetListRendererParams = useCallback((_: number, data: RegionSnippet) => ({
        id: data.id,
        title: data.title,
        snippet: data.snippet,
    }), []);

    return (
        <List
            className={styles.regionPreparedness}
            data={regionResponse?.preparedness_snippets}
            keySelector={keySelector}
            rendererParams={snippetListRendererParams}
            renderer={Snippet}
            pending={false}
            errored={false}
            filtered={false}
        />
    );
}

Component.displayName = 'RegionPreparedness';
