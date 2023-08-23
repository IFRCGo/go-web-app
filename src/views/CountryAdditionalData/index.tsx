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
import Message from '#components/Message';
import Link,
{
    type Props as LinkProps,
} from '#components/Link';
import {
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import HtmlOutput,
{
    type Props as HtmlOutputProps,
} from '#components/HtmlOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountrySnippetType = NonNullable<CountrySnippetResponse['results']>[number];
type CountryContactsType = NonNullable<CountryResponse['contacts']>[number];
type CountryLinksType = NonNullable<CountryResponse['links']>[number];

const contactKeySelector = (contact: CountryContactsType) => String(contact.id);
const snippetKeySelector = (snippet: CountrySnippetType) => snippet.id;
const linkKeySelector = (link: CountryLinksType) => link.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse, countrySnippetResponse } = useOutletContext<CountryOutletContext>();

    const hasCountrySnippet = (countrySnippetResponse?.results
        && (countrySnippetResponse.results.length > 0));

    const hasCountryContacts = (countryResponse?.contacts
        && (countryResponse.contacts.length > 0));

    const hasCountryLinks = (countryResponse?.links
        && (countryResponse.links.length > 0));

    const strings = useTranslation(i18n);

    const countrySnippetRendererParams = useCallback(
        (_: number, data: CountrySnippetType): HtmlOutputProps => ({
            className: styles.countrySnippetContent,
            value: data.snippet,
        }),
        [],
    );

    const countryLinkRendererParams = useCallback(
        (_: number, data: CountryLinksType): LinkProps => ({
            to: data.url,
            withExternalLinkIcon: true,
            children: data.title,
        }),
        [],
    );

    const contactTableColumns = useMemo(
        () => ([
            createStringColumn<CountryContactsType, string>(
                'name',
                strings.columnName,
                (item) => item.name,
            ),
            createStringColumn<CountryContactsType, string>(
                'title',
                strings.columnTitle,
                (item) => item.title,
            ),
            createStringColumn<CountryContactsType, string>(
                'ctype',
                strings.columnType,
                (item) => item.ctype,
            ),
            createStringColumn<CountryContactsType, string>(
                'email',
                strings.columnEmail,
                (item) => item.email,
            ),
        ]),
        [strings],
    );

    return (
        <div className={styles.additionalContent}>
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
            {hasCountryLinks && (
                <Container
                    withHeaderBorder
                    heading={strings.linkTitle}
                >
                    <List
                        data={countryResponse.links}
                        renderer={Link}
                        rendererParams={countryLinkRendererParams}
                        keySelector={linkKeySelector}
                        withoutMessage
                        compact
                        pending={false}
                        errored={false}
                        filtered={false}
                    />
                </Container>
            )}
            {(!hasCountryLinks && !hasCountryContacts && !hasCountrySnippet)
                && (
                    <Message
                        description={strings.noDataMessage}
                    />
                )}
        </div>
    );
}

Component.displayName = 'CountryAdditionalData';
