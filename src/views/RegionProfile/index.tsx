import { useParams } from 'react-router-dom';
import { RedCrossNationalSocietyIcon } from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import { RegionalProfile } from '#types/serverResponse';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';
import RichTextOutput from '#components/RichTextOutput';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const strings = useTranslation(i18n);

    const {
        response: regionalProfileResponse,
    } = useRequest<RegionalProfile>({
        skip: isNotDefined(regionId),
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
                    description={`
                        ${strings.regionalProfileNationalSocietyTitle}
                        ${regionalProfileResponse?.region_name}
                    `}
                />
            </Container>
            {regionalProfileResponse?.snippets && (
                <Container
                    heading={strings.regionalProfileFundingAndOperationsDashboards}
                    withHeaderBorder
                    headingLevel={2}
                >
                    <RichTextOutput
                        className={styles.iframe}
                        value={
                            <iframe
                            src={iframe}
                            title={regionalProfileResponse?.region_name}
                            />
                        }
                    />
                    {/* <iframe
                        src={iframe}
                        title={regionalProfileResponse?.region_name}
                        className={styles.iframe}
                    /> */}
                </Container>
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
