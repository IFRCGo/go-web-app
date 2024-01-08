import { useOutletContext } from 'react-router-dom';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { getCurrentMonthYear } from '#utils/common';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

function PresenceItem() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const presence = countryResponse?.icrc_presence;

    return (
        <div className={styles.presenceList}>
            <Container
                className={styles.presenceCard}
                childrenContainerClassName={styles.presenceCardList}
                heading={strings.countryIFRCPresenceTitle}
            >
                <div className={styles.ifrcPresenceItem}>
                    <TextOutput
                        label={strings.countryIFRCPresenceHeadOfDelegation}
                        value={undefined}
                    />
                    {/* //TODO: Add status Link */}
                    <Link
                        href="/"
                        external
                        variant="tertiary"
                        withUnderline
                    >
                        {strings.countryIFRCLegalStatus}
                    </Link>
                </div>
                <div className={styles.ifrcPresenceItem}>
                    <TextOutput
                        label={strings.countryIFRCContact}
                        value={undefined}
                    />
                    <Link
                        href={countryResponse?.disaster_law_url}
                        external
                        variant="tertiary"
                        withUnderline
                    >
                        {strings.countryIFRCDisasterLaw}
                    </Link>
                </div>
            </Container>
            {presence?.map((icrc) => (
                <Container
                    className={styles.presenceCard}
                    heading={strings.countryICRCPresenceTitle}
                    childrenContainerClassName={styles.presenceCardList}
                >
                    {resolveToString(
                        strings.countryICRCConfirmedPartner,
                        { year: getCurrentMonthYear() },
                    )}
                    <div className={styles.icrcPresenceItem}>
                        <Link
                            key={icrc.id}
                            href={icrc.url}
                            external
                            variant="tertiary"
                            withUnderline
                        >
                            {strings.countryICRCKeyOperations}
                        </Link>
                        {resolveToString(
                            strings.countryICRCWithin,
                            { name: countryResponse?.name ?? '--' },
                        )}
                    </div>
                </Container>
            ))}
        </div>
    );
}

export default PresenceItem;
