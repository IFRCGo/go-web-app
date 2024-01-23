import { useOutletContext } from 'react-router-dom';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';

import NationalSocietyContacts from './NationalSocietyContacts';
import NationalSocietyDirectory from './NationalSocietyDirectory';
import NationalSocietyIndicators from './NationalSocietyIndicators';
import NationalSocietyKeyDocuments from './NationalSocietyKeyDocuments';
import NationalSocietyLocalUnitsMap from './NationalSocietyLocalUnitsMap';
import NationalSocietyDirectoryInitiatives from './NsDirectoryInitiatives';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);

    return (
        <div className={styles.countryNsOverviewContextAndStructure}>
            <NationalSocietyIndicators />
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
                            variant="primary"
                        >
                            {strings.nationalSocietyPageOnFDRS}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.url_ifrc) && (
                        <Link
                            href={countryResponse.url_ifrc}
                            external
                            withLinkIcon
                            variant="primary"
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
                            variant="primary"
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
                            variant="primary"
                        >
                            {resolveToString(
                                strings.countryRCHomepage,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.disaster_law_url) && (
                        <Link
                            href={countryResponse?.disaster_law_url}
                            external
                            withLinkIcon
                            variant="primary"
                        >
                            {resolveToString(
                                strings.countryDisasterLaw,
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
