import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    type CountryResponse,
    type CountrySnippetResponse,
    type CountryOutletContext,
} from '#utils/outletContext';
import List from '#components/List';
import HtmlOutput,
{
    type Props as HtmlOutputProps,
} from '#components/HtmlOutput';

type CountrySnippetType = NonNullable<CountrySnippetResponse['results']>[number]
const SnippetKeySelector = (snippet: CountrySnippetType) => snippet.id;
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse, countrySnippetResponse } = useOutletContext<CountryOutletContext>();
    const hasCountrySnippet = (countrySnippetResponse?.results
        && (countrySnippetResponse.results.length > 0));

    const countrySnippetRendererParams = useCallback(
        (_: number, data: CountrySnippetType): HtmlOutputProps => ({
            value: data.snippet,
        }),
        [],
    );

    return (
        <div>
            {hasCountrySnippet && (
                <List
                    data={countrySnippetResponse.results}
                    renderer={HtmlOutput}
                    rendererParams={countrySnippetRendererParams}
                    keySelector={SnippetKeySelector}
                    withoutMessage
                    compact
                    pending={false}
                    errored={false}
                    filtered={false}
                />
            )}
        </div>
    );
}

Component.displayName = 'CountryAdditionalData';
