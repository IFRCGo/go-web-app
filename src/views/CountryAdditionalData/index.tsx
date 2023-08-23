import { useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    type CountryResponse,
    type CountrySnippetResponse,
    type CountryOutletContext,
} from '#utils/outletContext';
import List from '#components/List';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import Table from '#components/Table';
import {
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import HtmlOutput,
{
    type Props as HtmlOutputProps,
} from '#components/HtmlOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountrySnippetType = NonNullable<CountrySnippetResponse['results']>[number]
type CountryContactsType = NonNullable<CountryResponse['contacts']>[number]

const contactKeySelector = (contact: CountryContactsType) => String(contact.id);
const snippetKeySelector = (snippet: CountrySnippetType) => snippet.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse, countrySnippetResponse } = useOutletContext<CountryOutletContext>();
    const hasCountrySnippet = (countrySnippetResponse?.results
        && (countrySnippetResponse.results.length > 0));

    const hasCountryContacts = (countryResponse?.contacts
        && (countryResponse.contacts.length > 0));

    const strings = useTranslation(i18n);
    const countrySnippetRendererParams = useCallback(
        (_: number, data: CountrySnippetType): HtmlOutputProps => ({
            className: styles.countrySnippetContent,
            value: data.snippet,
        }),
        [],
    );

    const contactTableColumns = useMemo(
        () => ([
            createStringColumn<CountryContactsType, string>(
                'name',
                'Name',
                (item) => item.name,
            ),
            createStringColumn<CountryContactsType, string>(
                'title',
                'Title',
                (item) => item.title,
            ),
            createStringColumn<CountryContactsType, string>(
                'ctype',
                'Type',
                (item) => item.ctype,
            ),
            createStringColumn<CountryContactsType, string>(
                'email',
                'Email',
                (item) => item.email,
            ),
        ]),
        [],
    );

    return (
        <div>
            {hasCountrySnippet && (
                <List
                    data={countrySnippetResponse.results}
                    renderer={HtmlOutput}
                    rendererParams={countrySnippetRendererParams}
                    keySelector={snippetKeySelector}
                    withoutMessage
                    compact
                    pending={false}
                    errored={false}
                    filtered={false}
                />
            )}
            {hasCountryContacts && (
                <Container
                    heading={strings.contactTitle}
                    withHeaderBorder
                >
                    <Table
                        columns={contactTableColumns}
                        filtered={false}
                        pending={false}
                        keySelector={contactKeySelector}
                        data={countryResponse.contacts}
                    />
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'CountryAdditionalData';
