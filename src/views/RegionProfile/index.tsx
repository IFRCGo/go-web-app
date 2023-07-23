import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RedCrossNationalSocietyIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import HtmlOutput from '#components/HtmlOutput';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import type { RegionOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
                    compactValue
                    description={
                        resolveToString(
                            strings.regionalProfileNationalSocietyTitle,
                            { regionName: regionResponse?.region_name ?? '-' },
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
                            to={`${link?.url}`}
                            withUnderline
                            withExternalLinkIcon
                        >
                            {link?.title}
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
                    {regionResponse?.contacts.map((contact) => (
                        <Fragment key={contact.id}>
                            <div>{contact?.name}</div>
                            <div>{contact?.title}</div>
                            <div>{contact?.ctype}</div>
                            <div>{contact?.email}</div>
                            <div className={styles.spacer} />
                        </Fragment>
                    ))}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'RegionProfile';
