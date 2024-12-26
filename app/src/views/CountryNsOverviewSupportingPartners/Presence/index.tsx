import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    InfoPopup,
    RawList,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import {
    type CountryOutletContext,
    type CountryResponse,
} from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

const year = new Date().getFullYear();

const legalStatusLink = 'https://ifrcorg.sharepoint.com/sites/OurIFRCLegal/SitePages/Legal-Resources.aspx';

interface DelegationInformationProps {
    name: string | null | undefined;
    // contact: string | null | undefined;
    delegationOfficeType: string;
    address: string;
}

type CountryDelegation = NonNullable<CountryResponse>['country_delegation'][number];
const countryDelegationKeySelector = (countryDelegation: CountryDelegation) => (
    `${countryDelegation.dotype_name}-${countryDelegation.hod_first_name}-${countryDelegation.hod_last_name}`
);

function DelegationInformation(props: DelegationInformationProps) {
    const {
        name,
        // contact,
        delegationOfficeType,
        address,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <div className={styles.delegation}>
            <TextOutput
                label={resolveToString(
                    strings.countryIFRCPresenceHeadOfDelegation,
                    { delegationOfficeType },
                )}
                value={name}
                strongValue
            />
            {/* NOTE: Hide it for now, not sure if we can publish or not */}
            {/*
            <TextOutput
                label={strings.countryIFRCContact}
                value={contact}
                strongValue
            />
              */}
            <TextOutput
                label={strings.countryIFRCDelegationType}
                value={delegationOfficeType}
                strongValue
            />
            <TextOutput
                valueClassName={styles.location}
                label={strings.countryIFRCLocation}
                value={address}
                strongValue
            />
        </div>
    );
}

function Presence() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const countryDelegationRendererParams = useCallback((_: string, value: CountryDelegation) => {
        const hodName = [
            value.hod_first_name,
            value.hod_last_name,
        ].filter(isTruthyString).join(' ');

        const address = [
            value.address,
            value.city,
        ].filter(isTruthyString).join(', ');

        return {
            name: hodName,
            contact: value.hod_mobile_number,
            delegationOfficeType: value.dotype_name,
            address,
        };
    }, []);
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
                // NOTE: Hide it for now, not sure if we can publish or not
                // footerActions={(
                //     <TextOutput
                //         label={strings.source}
                //         value={(
                //             <Link
                //                 variant="tertiary"
                //                 href="https://data.ifrc.org/fdrs/ifrc-secretariat/"
                //                 external
                //                 withUnderline
                //             >
                //                 {strings.fdrs}
                //             </Link>
                //         )}
                //     />
                // )}
                withHeaderBorder
                withInternalPadding
                childrenContainerClassName={styles.content}
            >
                <div className={styles.delegationInformation}>
                    <RawList
                        data={countryResponse?.country_delegation}
                        keySelector={countryDelegationKeySelector}
                        renderer={DelegationInformation}
                        rendererParams={countryDelegationRendererParams}
                    />
                </div>
                <div className={styles.ifrcPresenceItem}>
                    <div className={styles.ifrcDisclaimer}>
                        <Link
                            href={legalStatusLink}
                            external
                            variant="tertiary"
                            withUnderline
                        >
                            {strings.countryIFRCLegalStatus}
                        </Link>
                        <InfoPopup
                            description={strings.disclaimer}
                        />
                    </div>

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
            {countryResponse?.icrc_presence?.icrc_presence && (
                <Container
                    className={styles.presenceCard}
                    heading={strings.countryICRCPresenceTitle}
                    footerActions={isDefined(countryResponse.icrc_presence.url) && (
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
                    withHeaderBorder
                    withInternalPadding
                >
                    {
                        resolveToString(
                            strings.countryICRCConfirmedPartner,
                            { year },
                        )
                    }
                    {countryResponse.icrc_presence.key_operation && (
                        <div className={styles.icrcPresenceItem}>
                            <Link
                                key={countryResponse.icrc_presence.id}
                                href={countryResponse.icrc_presence.url}
                                external
                                variant="tertiary"
                                withUnderline
                            >
                                {strings.countryICRCKeyOperations}
                            </Link>
                            {resolveToString(
                                strings.countryICRCWithin,
                                { name: countryResponse.name ?? '--' },
                            )}
                        </div>
                    )}
                </Container>
            )}
        </Container>
    );
}

export default Presence;
