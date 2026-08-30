import { useOutletContext } from 'react-router-dom';
import { RedCrossNationalSocietyIcon } from '@ifrc-go/icons';
import {
    Container,
    Description,
    HtmlOutput,
    KeyFigureView,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    DEFAULT_INVALID_TEXT,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
    isValidEmail,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { type RegionOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    return (
        <TabPage>
            <ListView
                layout="grid"
                numPreferredGridColumns={3}
            >
                <KeyFigureView
                    icon={<RedCrossNationalSocietyIcon />}
                    value={Number(regionResponse?.national_society_count)}
                    valueOptions={{ compact: true }}
                    valueType="number"
                    size="lg"
                    label={(
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                            spacing="sm"
                        >
                            <div>
                                {resolveToString(
                                    strings.regionalProfileNationalSocietyTitle,
                                    {
                                        regionName: regionResponse?.region_name
                                            ?? DEFAULT_INVALID_TEXT,
                                    },
                                )}
                            </div>
                            <Description withLightText>
                                {strings.regionalProfileSource}
                            </Description>
                        </ListView>
                    )}
                    withShadow
                />
            </ListView>
            {regionResponse?.profile_snippets.filter(
                ({ snippet }) => isTruthyString(snippet),
            ).map((profileSnippet) => (
                <Container
                    key={profileSnippet.id}
                    heading={profileSnippet.title}
                    withHeaderBorder
                >
                    <HtmlOutput
                        value={profileSnippet.snippet}
                        key={profileSnippet.id}
                    />
                </Container>
            ))}
            {regionResponse?.links && regionResponse?.links.length > 0 && (
                <Container
                    heading={strings.regionalProfileAdditionalLinks}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={2}
                        withSpacingOpticalCorrection
                        spacing="sm"
                    >
                        {regionResponse?.links.map((link) => (
                            <Link
                                key={link.id}
                                href={link.url}
                                external
                                withLinkIcon
                            >
                                {link.title}
                            </Link>
                        ))}
                    </ListView>
                </Container>
            )}
            {regionResponse?.contacts && regionResponse?.contacts.length > 0 && (
                <Container
                    heading={strings.regionProfileContacts}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={4}
                    >
                        {regionResponse.contacts.map((contact) => (
                            <Container
                                key={contact.id}
                                heading={contact.name}
                                headingLevel={5}
                                headerDescription={contact.title}
                                withBackground
                                withShadow
                                withPadding
                            >
                                <ListView
                                    layout="block"
                                    spacing="sm"
                                    withSpacingOpticalCorrection
                                >
                                    {isDefined(contact.ctype) && (
                                        <div>{contact.ctype}</div>
                                    )}
                                    {isValidEmail(contact.email) ? (
                                        <Link
                                            href={`mailto:${contact.email}`}
                                            external
                                            withLinkIcon
                                        >
                                            {contact.email}
                                        </Link>
                                    ) : (
                                        <div>{contact.email}</div>
                                    )}
                                </ListView>
                            </Container>
                        ))}
                    </ListView>
                </Container>
            )}
        </TabPage>
    );
}

Component.displayName = 'RegionProfile';
