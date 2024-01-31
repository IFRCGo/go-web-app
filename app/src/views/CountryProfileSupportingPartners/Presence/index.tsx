import { useOutletContext } from 'react-router-dom';
import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { isTruthyString } from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

const year = new Date().getFullYear();
const legalStatusLink = 'https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/PageFiles/255835/List%20States%20with%20Defined%20Legal%20Status%2025.07.2023_ENG.pdf';

function Presence() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const hodValue = [
        countryResponse?.country_delegation?.hod_first_name,
        countryResponse?.country_delegation?.hod_last_name,
    ].filter(isTruthyString).join(' ');

    return (
        <div className={styles.presence}>
            <Container
                className={styles.presenceCard}
                childrenContainerClassName={styles.presenceCardList}
                heading={strings.countryIFRCPresenceTitle}
            >
                <div className={styles.ifrcPresenceItem}>
                    <TextOutput
                        label={strings.countryIFRCPresenceHeadOfDelegation}
                        value={hodValue}
                        strongValue
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
                        value={countryResponse?.country_delegation?.hod_mobile_number}
                        strongValue
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
            <Container
                className={styles.presenceCard}
                heading={strings.countryICRCPresenceTitle}
                childrenContainerClassName={styles.presenceCardList}
            >
                {resolveToString(
                    strings.countryICRCConfirmedPartner,
                    { year },
                )}
                {countryResponse?.icrc_presence?.key_operation && (
                    <div className={styles.icrcPresenceItem}>
                        <Link
                            key={countryResponse?.icrc_presence.id}
                            href={countryResponse?.icrc_presence.url}
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
                )}
            </Container>
        </div>
    );
}

export default Presence;
