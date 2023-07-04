import { useParams } from 'react-router-dom';
import { RedCrossNationalSocietyIcon } from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import { resolveToString } from '#utils/translation';

import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import RichTextOutput from '#components/RichTextOutput';
import useTranslation from '#hooks/useTranslation';
import { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetRegion = paths['/api/v2/region/{id}/']['get'];
type GetRegionResponse = GetRegion['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const strings = useTranslation(i18n);

    const {
        response: regionalProfileResponse,
    } = useRequest<GetRegionResponse>({
        skip: isNotDefined(regionId),
        url: `api/v2/region/${regionId}/`,
    });

    return (
        <div className={styles.regionProfile}>
            <Container
                className={styles.highlightedOperations}
                withHeaderBorder
            >
                <KeyFigure
                    icon={<RedCrossNationalSocietyIcon />}
                    className={styles.keyFigure}
                    value={regionalProfileResponse?.national_society_count}
                    compactValue
                    description={
                        resolveToString(
                            strings.regionalProfileNationalSocietyTitle,
                            { regionName: regionalProfileResponse?.region_name ?? '-' },
                        )
                    }
                />
            </Container>
            {regionalProfileResponse?.profile_snippets
            && regionalProfileResponse.profile_snippets.length > 0
            && (regionalProfileResponse.profile_snippets.map((profileSnippet) => (
                <Container
                    heading={profileSnippet.title}
                    withHeaderBorder
                    headingLevel={2}
                >
                    <RichTextOutput
                        className={styles.iframe}
                        value={profileSnippet.snippet}
                        key={profileSnippet.id}
                    />
                </Container>
            ))
            )}
            {regionalProfileResponse?.links
            && regionalProfileResponse?.links.length > 0 && (
                <Container
                    heading={strings.regionalProfileAdditionalLinks}
                    withHeaderBorder
                    childrenContainerClassName={styles.additionalList}
                    headingLevel={2}
                >
                    {regionalProfileResponse?.links.map((link) => (
                        <Link
                            to={`${link?.url}`}
                            className={styles.linkLists}
                            withUnderline
                        >
                            {link?.title}
                        </Link>
                    ))}
                </Container>
            )}
            {regionalProfileResponse?.contacts
            && regionalProfileResponse?.contacts.length > 0 && (
                <Container
                    heading={strings.regionProfileContacts}
                    childrenContainerClassName={styles.componentList}
                    withHeaderBorder
                    headingLevel={2}
                >
                    {regionalProfileResponse?.contacts.map((contact) => (
                        <div className={styles.contactList}>
                            {contact?.name}
                            {contact?.title}
                            {contact?.ctype}
                            {contact?.email}
                        </div>
                    ))}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'RegionProfile';
