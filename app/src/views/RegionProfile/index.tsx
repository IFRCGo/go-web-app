import { useOutletContext } from 'react-router-dom';
import { RedCrossNationalSocietyIcon } from '@ifrc-go/icons';
import {
    Container,
    Description,
    HtmlDisplay,
    KeyFigureCard,
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

/** @knipignore */
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
                <KeyFigureCard
                    icon={<RedCrossNationalSocietyIcon />}
                    value={Number(regionResponse?.national_society_count)}
                    compact
                    valueType="number"
                    textSize="4xl"
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
                    boxShadow="md"
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
                    <HtmlDisplay
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
                                backgroundColor="foreground"
                                boxShadow="md"
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
