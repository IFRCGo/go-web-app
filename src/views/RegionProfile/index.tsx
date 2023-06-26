import { useParams } from 'react-router-dom';
import { RedCrossNationalSocietyIcon } from '@ifrc-go/icons';

import { useRequest } from '#utils/restRequest';

import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface RegionProfileSnippet {
    region: number;
    visibility: number;
    id: number;
    snippet: string;
}

interface AdditionalLinks {
    id: number;
    show_in_go: boolean;
    title: string;
    url: string;
}

interface Contacts {
    ctype: string;
    email: string;
    id: number;
    name: string;
    title: string;
}

interface RegionalProfile {
    name: number;
    region_name: string;
    national_society_count: number;
    snippets: RegionProfileSnippet[];
    links: AdditionalLinks[];
    contacts: Contacts[];
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const strings = useTranslation(i18n);

    const {
        response: regionalProfileResponse,
    } = useRequest<RegionalProfile>({
        skip: !regionId,
        url: `api/v2/region/${regionId}/`,
    });

    const iframe = 'https://app.powerbi.com/view?r=eyJrIjoiOWUzMTIzODctZGFmNS00M2Y2LThjOTYtYjNhOTJhMWEzOTdjIiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9%5C';

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
                    description={`National Society in ${regionalProfileResponse?.region_name}`}
                />
            </Container>
            {regionalProfileResponse?.snippets && (
                <Container
                    heading={strings.regionalProfileFundingAndOperationsDashboards}
                    withHeaderBorder
                    headingLevel={2}
                >
                    <iframe
                        src={iframe}
                        title={regionalProfileResponse?.region_name}
                        className={styles.iframe}
                    />
                </Container>
            )}
            {regionalProfileResponse?.links && (
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
            {regionalProfileResponse?.contacts && (
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
