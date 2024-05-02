import { useOutletContext } from 'react-router-dom';
import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

const year = new Date().getFullYear();
const legalStatusLink = 'https://fednet.ifrc.org/en/support/legal/legal/legal-status/';

function Presence() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const hodValue = [
        countryResponse?.country_delegation?.hod_first_name,
        countryResponse?.country_delegation?.hod_last_name,
    ].filter(isTruthyString).join(' ');

    return (
        <Container
            className={styles.presence}
            contentViewType="grid"
            numPreferredGridContentColumns={2}
            spacing="comfortable"
        >
            <Container
                className={styles.presenceCard}
                heading={strings.countryIFRCPresenceTitle}
                footerActions={(
                    <TextOutput
                        label={strings.source}
                        value={(
                            <Link
                                variant="tertiary"
                                href="https://data.ifrc.org/fdrs/ifrc-secretariat/"
                                external
                                withUnderline
                            >
                                {strings.fdrs}
                            </Link>
                        )}
                    />
                )}
                contentViewType="vertical"
                withHeaderBorder
                withInternalPadding
                spacing="comfortable"
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
                    {isDefined(countryResponse?.disaster_law_url) && (
                        <Link
                            href={countryResponse.disaster_law_url}
                            external
                            variant="tertiary"
                            withUnderline
                        >
                            {strings.countryIFRCDisasterLaw}
                        </Link>
                    )}
                </div>
            </Container>
            <Container
                className={styles.presenceCard}
                heading={strings.countryICRCPresenceTitle}
                footerActions={isDefined(countryResponse?.icrc_presence?.url) && (
                    <TextOutput
                        label={strings.source}
                        value={(
                            <Link
                                variant="tertiary"
                                href={countryResponse.icrc_presence.url}
                                external
                                withUnderline
                            >
                                {strings.icrc}
                            </Link>
                        )}
                    />
                )}
                contentViewType="vertical"
                withHeaderBorder
                withInternalPadding
                spacing="comfortable"
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
        </Container>
    );
}

export default Presence;
