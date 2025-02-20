import { useOutletContext } from 'react-router-dom';
import { RedCrossNationalSocietyIcon } from '@ifrc-go/icons';
import {
    Container,
    HtmlOutput,
    KeyFigure,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    DEFAULT_INVALID_TEXT,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isValidEmail } from '@togglecorp/fujs';

import Link from '#components/Link';
import { type RegionOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    return (
        <div className={styles.regionProfile}>
            <div className={styles.keyFigures}>
                <KeyFigure
                    icon={<RedCrossNationalSocietyIcon />}
                    className={styles.keyFigure}
                    value={Number(regionResponse?.national_society_count)}
                    description={strings.regionalProfileSource}
                    compactValue
                    label={
                        resolveToString(
                            strings.regionalProfileNationalSocietyTitle,
                            { regionName: regionResponse?.region_name ?? DEFAULT_INVALID_TEXT },
                        )
                    }
                />
            </div>
            {regionResponse?.profile_snippets.map((profileSnippet) => (
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
                    childrenContainerClassName={styles.additionalLinks}
                >
                    {regionResponse?.links.map((link) => (
                        <Link
                            key={link.id}
                            href={link.url}
                            external
                            withUnderline
                            withLinkIcon
                        >
                            {link.title}
                        </Link>
                    ))}
                </Container>
            )}
            {regionResponse?.contacts && regionResponse?.contacts.length > 0 && (
                <Container
                    heading={strings.regionProfileContacts}
                    withHeaderBorder
                    childrenContainerClassName={styles.contactList}
                >
                    {regionResponse.contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className={styles.contact}
                        >
                            <div>
                                <div className={styles.name}>{contact.name}</div>
                                <div className={styles.title}>{contact.title}</div>
                            </div>
                            <div>
                                <div>{contact.ctype}</div>
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
                            </div>
                        </div>
                    ))}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'RegionProfile';
