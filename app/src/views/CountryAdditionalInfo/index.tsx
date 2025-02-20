import {
    useCallback,
    useMemo,
} from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import {
    Container,
    HtmlOutput,
    type HtmlOutputProps,
    List,
    Message,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import Link, { type Props as LinkProps } from '#components/Link';
import WikiLink from '#components/WikiLink';
import {
    type CountryOutletContext,
    type CountryResponse,
} from '#utils/outletContext';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountrySnippetType = NonNullable<GoApiResponse<'/api/v2/country_snippet/'>['results']>[number];
type CountryContactsType = NonNullable<CountryResponse['contacts']>[number];
type CountryLinksType = NonNullable<CountryResponse['links']>[number];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const {
        pending: countrySnippetPending,
        response: countrySnippetResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/country_snippet/',
        query: { country: Number(countryId) },
    });

    const hasCountrySnippet = countrySnippetResponse?.results
        && countrySnippetResponse.results.length > 0;

    const hasCountryContacts = countryResponse?.contacts
        && countryResponse.contacts.length > 0;

    const hasCountryLinks = countryResponse?.links
        && countryResponse.links.length > 0;

    const strings = useTranslation(i18n);

    const countrySnippetRendererParams = useCallback(
        (_: number, data: CountrySnippetType): HtmlOutputProps => ({
            value: data.snippet,
        }),
        [],
    );

    const countryLinkRendererParams = useCallback(
        (_: number, data: CountryLinksType): LinkProps => ({
            href: data.url,
            external: true,
            withLinkIcon: true,
            children: data.title,
        }),
        [],
    );

    const contactTableColumns = useMemo(
        () => ([
            createStringColumn<CountryContactsType, number>(
                'name',
                strings.columnName,
                (item) => item.name,
            ),
            createStringColumn<CountryContactsType, number>(
                'title',
                strings.columnTitle,
                (item) => item.title,
            ),
            createStringColumn<CountryContactsType, number>(
                'ctype',
                strings.columnType,
                (item) => item.ctype,
            ),
            createStringColumn<CountryContactsType, number>(
                'email',
                strings.columnEmail,
                (item) => item.email,
            ),
        ]),
        [
            strings.columnName,
            strings.columnTitle,
            strings.columnType,
            strings.columnEmail,
        ],
    );

    const isDataAvailable = hasCountryLinks || hasCountryContacts || hasCountrySnippet;

    return (
        <Container
            className={styles.countryAdditionalData}
            actions={(
                <WikiLink
                    href="user_guide/Country_Pages#additional-data"
                />
            )}
        >
            {hasCountrySnippet && (
                <List
                    data={countrySnippetResponse.results}
                    renderer={HtmlOutput}
                    rendererParams={countrySnippetRendererParams}
                    keySelector={numericIdSelector}
                    withoutMessage
                    compact
                    pending={countrySnippetPending}
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
                        keySelector={numericIdSelector}
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
                        keySelector={numericIdSelector}
                        withoutMessage
                        compact
                        pending={false}
                        errored={false}
                        filtered={false}
                    />
                </Container>
            )}
            {!isDataAvailable && (
                <Message
                    pending={countrySnippetPending}
                    description={!countrySnippetPending && strings.noDataMessage}
                />
            )}
        </Container>
    );
}

Component.displayName = 'CountryAdditionalInfo';
