import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    DefaultMessage,
    HtmlDisplay,
    ListView,
    RawList,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';

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
            <HtmlDisplay
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

    const snippets = regionResponse?.preparedness_snippets;

    return (
        <ListView
            className={styles.regionPreparedness}
            layout="block"
        >
            <RawList
                data={snippets}
                keySelector={keySelector}
                rendererParams={snippetListRendererParams}
                renderer={Snippet}
            />
            <DefaultMessage
                pending={false}
                errored={false}
                filtered={false}
                empty={isNotDefined(snippets) || snippets.length === 0}
            />
        </ListView>
    );
}

Component.displayName = 'RegionPreparedness';
