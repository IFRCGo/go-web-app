import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    Description,
    HtmlOutput,
    type HtmlOutputProps,
    KeyFigureView,
    ListView,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import {
    type RegionKeyFigureResponse,
    type RegionOutletContext,
    type RegionResponse,
} from '#utils/outletContext';

import i18n from './i18n.json';

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
        <KeyFigureView
            // FIXME: fix typings from server (medium priority)
            // FIXME: Do we need to round this similar to EmergencyDetails/KeyFigure?
            value={Number.parseFloat(figure)}
            valueType="number"
            label={(
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                    spacing="sm"
                >
                    <div>
                        {deck}
                    </div>
                    <Description withLightText>
                        {resolveToString(
                            strings.sourceLabel,
                            { sourceValue: source },
                        )}
                    </Description>
                </ListView>
            )}
            withShadow
        />
    );
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        regionResponse,
        regionKeyFigureResponse,
    } = useOutletContext<RegionOutletContext>();

    const hasKeyFigure = regionKeyFigureResponse?.results
        && regionKeyFigureResponse.results.length > 0;

    const snippets = regionResponse?.snippets.filter(
        ({ snippet }) => isTruthyString(snippet),
    );
    const hasRegionResponse = isDefined(snippets)
        && snippets.length > 0;

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
            value: data.snippet,
        }),
        [],
    );

    return (
        <TabPage
            empty={!hasKeyFigure && !hasRegionResponse}
            emptyMessage={strings.noDataMessage}
        >
            {hasKeyFigure && (
                <Container
                    heading={strings.keyFigureHeading}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={3}
                    >
                        <RawList
                            data={regionKeyFigureResponse.results}
                            rendererParams={regionKeyFigureParams}
                            renderer={RegionKeyFigure}
                            keySelector={keyFigureKeySelector}
                        />
                    </ListView>
                </Container>
            )}
            {hasRegionResponse && (
                <Container
                    heading={strings.containerTitle}
                    withHeaderBorder
                >
                    <ListView layout="block">
                        <RawList
                            data={snippets}
                            keySelector={snippetKeySelector}
                            renderer={HtmlOutput}
                            rendererParams={regionSnippetParams}
                        />
                    </ListView>
                </Container>
            )}
        </TabPage>
    );
}

Component.displayName = 'RegionAdditionalInfo';
