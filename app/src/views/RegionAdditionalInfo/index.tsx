import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    HtmlOutput,
    type HtmlOutputProps,
    KeyFigure,
    List,
    Message,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import {
    type RegionKeyFigureResponse,
    type RegionOutletContext,
    type RegionResponse,
} from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegionKeyFigureType = NonNullable<RegionKeyFigureResponse['results']>[number];
type RegionSnippetType = NonNullable<RegionResponse['snippets']>[number];

const keyFigureKeySelector = (d: RegionKeyFigureType) => d.id;
const snippetKeySelector = (s: RegionSnippetType) => s.id;

interface RegionKeyFigureProps {
    figure: string;
    deck: string | null | undefined;
    source: string;
}

function RegionKeyFigure(props: RegionKeyFigureProps) {
    const {
        figure,
        deck,
        source,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <KeyFigure
            className={styles.regionKeyFigure}
            // FIXME: fix typings from server (medium priority)
            // FIXME: Do we need to round this similar to EmergencyDetails/KeyFigure?
            value={Number.parseFloat(figure)}
            label={deck}
            description={resolveToString(
                strings.sourceLabel,
                {
                    sourceValue: source,
                },
            )}
        />
    );
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        regionResponse,
        regionKeyFigureResponse,
    } = useOutletContext<RegionOutletContext>();

    const hasKeyFigure = regionKeyFigureResponse?.results
        && regionKeyFigureResponse.results.length > 0;
    const hasRegionResponse = regionResponse
        && regionResponse?.snippets.length > 0;

    const regionKeyFigureParams = useCallback(
        (_: number, data: RegionKeyFigureType): RegionKeyFigureProps => ({
            figure: data.figure,
            deck: data.deck,
            source: data.source,
        }),
        [],
    );

    const regionSnippetParams = useCallback(
        (_: number, data: RegionSnippetType): HtmlOutputProps => ({
            className: styles.regionalContent,
            value: data.snippet,
        }),
        [],
    );

    return (
        <div className={styles.regionAdditionalInfo}>
            {hasKeyFigure && (
                <Container
                    heading={strings.keyFigureHeading}
                    withHeaderBorder
                >
                    <List
                        className={styles.keyFigureList}
                        data={regionKeyFigureResponse.results}
                        rendererParams={regionKeyFigureParams}
                        renderer={RegionKeyFigure}
                        keySelector={keyFigureKeySelector}
                        withoutMessage
                        compact
                        pending={false}
                        errored={false}
                        filtered={false}
                    />
                </Container>
            )}
            {hasRegionResponse && (
                <Container
                    heading={strings.containerTitle}
                    withHeaderBorder
                >
                    <List
                        data={regionResponse.snippets}
                        keySelector={snippetKeySelector}
                        renderer={HtmlOutput}
                        rendererParams={regionSnippetParams}
                        withoutMessage
                        compact
                        pending={false}
                        errored={false}
                        filtered={false}
                    />
                </Container>
            )}
            {!hasKeyFigure && !hasRegionResponse && (
                <Message
                    description={strings.noDataMessage}
                />
            )}
        </div>
    );
}

Component.displayName = 'RegionAdditionalInfo';
