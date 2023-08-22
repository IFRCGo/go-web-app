import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

import {
    type RegionOutletContext,
    type RegionKeyFigureResponse,
    type RegionResponse,
} from '#utils/outletContext';
import HtmlOutput, { type Props as HtmlOutputProps } from '#components/HtmlOutput';
import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import TextOutput from '#components/TextOutput';
import Message from '#components/Message';
import List from '#components/List';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegionKeyFigureType = NonNullable<RegionKeyFigureResponse['results']>[number];
type RegionSnippetType = NonNullable<RegionResponse['snippets']>[number];

const keyFigureKeySelector = (d: RegionKeyFigureType) => d.id;
const snippetKeySelector = (s: RegionSnippetType) => s.id;

interface RegionKeyFigureProps {
    figure: string;
    deck: string;
    source: string;
    label: string;
}

function RegionKeyFigure(props: RegionKeyFigureProps) {
    const {
        figure,
        deck,
        source,
        label,
    } = props;

    return (
        // NOTE also design may vary from original we need to fix that too
        <KeyFigure
            className={styles.regionKeyFigure}
            // NOTE we should maintain key figures to take value as strings
            value={Number.parseFloat(figure)}
            description={deck}
        >
            <TextOutput
                value={source}
                label={label}
            />
        </KeyFigure>
    );
}
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { regionResponse, regionKeyFigureResponse } = useOutletContext<RegionOutletContext>();
    const hasKeyFigure = (regionKeyFigureResponse?.results
        && (regionKeyFigureResponse.results.length > 0));
    const hasRegionResponse = (regionResponse
        && (regionResponse?.snippets.length > 0));

    const regionKeyFigureParams = useCallback(
        (_: number, data: RegionKeyFigureType): RegionKeyFigureProps => ({
            figure: data.figure,
            deck: data.deck,
            label: strings.keyFigureLabel,
            source: data.source,
        }),
        [strings.keyFigureLabel],
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
                    childrenContainerClassName={styles.keyFigureContent}
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
            {(!hasKeyFigure && !hasRegionResponse)
                && (
                    <Message
                        description={strings.NoDataMessage}
                    />
                )}
        </div>
    );
}

Component.displayName = 'RegionAdditionalInfo';
