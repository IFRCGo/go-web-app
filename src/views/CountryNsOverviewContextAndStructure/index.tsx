import { useOutletContext } from 'react-router-dom';
import { isDefined, isTruthyString } from '@togglecorp/fujs';

import Link from '#components/Link';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveToString } from '#utils/translation';

import NationalSocietyContacts from './NationalSocietyContacts';
import NationalSocietyDirectory from './NationalSocietyDirectory';
import NationalSocietyDirectoryInitiatives from './NsDirectoryInitiatives';
import NationalSocietyKeyDocuments from './NationalSocietyKeyDocuments';
import NationalSocietyLocalUnitsMap from './NationalSocietyLocalUnitsMap';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);

    return (
        <div className={styles.countryNsOverviewContextAndStructure}>
            <div className={styles.nationalSocietyDetail}>
                <NationalSocietyLocalUnitsMap className={styles.map} />
                <NationalSocietyDirectory className={styles.directory} />
            </div>
            <NationalSocietyDirectoryInitiatives />
            <NationalSocietyContacts />
            <NationalSocietyKeyDocuments />
            {isDefined(countryResponse) && (
                <Container
                    heading={strings.keyLinksHeading}
                    className={styles.keyLinks}
                    withHeaderBorder
                    childrenContainerClassName={styles.keyLinksContent}
                >
                    {isTruthyString(countryResponse.fdrs) && (
                        <Link
                            href={`https://data.ifrc.org/FDRS/national-society/${countryResponse.fdrs}`}
                            external
                            withLinkIcon
                        >
                            {strings.nationalSocietyPageOnFDRS}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.url_ifrc) && (
                        <Link
                            href={countryResponse.url_ifrc}
                            external
                            withLinkIcon
                        >
                            {resolveToString(
                                strings.countryOnIFRC,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.iso3) && (
                        <Link
                            href={`https://reliefweb.int/country/${countryResponse.iso3}`}
                            external
                            withLinkIcon
                        >
                            {resolveToString(
                                strings.countryOnReliefWeb,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.society_url) && (
                        <Link
                            href={countryResponse?.society_url}
                            external
                            withLinkIcon
                        >
                            {resolveToString(
                                strings.countryRCHomepage,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'CountryNsOverviewContextAndStructure';
