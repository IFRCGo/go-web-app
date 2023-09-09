import { useCallback, useMemo } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';

import {
    type CountryResponse,
    type CountryOutletContext,
} from '#utils/outletContext';
import { type GoApiResponse, useRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import List from '#components/List';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import Table from '#components/Table';
import Message from '#components/Message';
import Link, { type Props as LinkProps } from '#components/Link';
import { createStringColumn } from '#components/Table/ColumnShortcuts';
import HtmlOutput, { type Props as HtmlOutputProps } from '#components/HtmlOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountrySnippetType = NonNullable<GoApiResponse<'/api/v2/country_snippet/'>['results']>[number];
type CountryContactsType = NonNullable<CountryResponse['contacts']>[number];
type CountryLinksType = NonNullable<CountryResponse['links']>[number];

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
            to: data.url,
            external: true,
            withExternalLinkIcon: true,
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
        [strings],
    );

    const isDataAvailable = hasCountryLinks || hasCountryContacts || hasCountrySnippet;

    return (
        <div className={styles.countryAdditionalData}>
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
        </div>
    );
}

Component.displayName = 'CountryAdditionalData';
