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
    const icrcPresenceDetail = countryResponse?.icrc_presence;

    const legalStatusLink = 'https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/PageFiles/255835/List%20States%20with%20Defined%20Legal%20Status%2025.07.2023_ENG.pdf';

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
                    <Link
                        href={legalStatusLink}
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
            {icrcPresenceDetail?.map((icrc) => (
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
