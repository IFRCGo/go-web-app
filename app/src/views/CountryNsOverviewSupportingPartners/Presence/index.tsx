import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    DataDisplay,
    InlineLayout,
    ListView,
    MoreInfo,
    RawList,
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
            <DataDisplay
                label={resolveToString(
                    strings.countryIFRCPresenceHeadOfDelegation,
                    { delegationOfficeType },
                )}
                value={name}
                strongValue
            />
            {/* NOTE: Hide it for now, not sure if we can publish or not */}
            {/*
            <DataDisplay
                label={strings.countryIFRCContact}
                value={contact}
                strongValue
            />
              */}
            <DataDisplay
                label={strings.countryIFRCDelegationType}
                value={delegationOfficeType}
                strongValue
            />
            <DataDisplay
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
        <ListView
            layout="grid"
        >
            <Container
                empty={false}
                errored={false}
                filtered={false}
                pending={false}
                className={styles.presenceCard}
                heading={strings.countryIFRCPresenceTitle}
                boxShadow="md"
                withPadding
                backgroundColor="foreground"
                // NOTE: Hide it for now, not sure if we can publish or not
                // footerActions={(
                //     <DataDisplay
                //         label={strings.source}
                //         value={(
                //             <Link
                //                 styleVariant="action"
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
                footer={(
                    <ListView withWrap>
                        <InlineLayout
                            after={(
                                <MoreInfo>
                                    {strings.disclaimer}
                                </MoreInfo>
                            )}
                            spacing="2xs"
                        >
                            <Link
                                href={legalStatusLink}
                                external
                                styleVariant="action"
                                withUnderline
                                withLinkIcon
                            >
                                {strings.countryIFRCLegalStatus}
                            </Link>
                        </InlineLayout>
                        {isDefined(countryResponse?.disaster_law_url) && (
                            <Link
                                href={countryResponse.disaster_law_url}
                                external
                                styleVariant="action"
                                withUnderline
                                withLinkIcon
                            >
                                {strings.countryIFRCDisasterLaw}
                            </Link>
                        )}
                    </ListView>
                )}
            >
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                >
                    <RawList
                        data={countryResponse?.country_delegation}
                        keySelector={countryDelegationKeySelector}
                        renderer={DelegationInformation}
                        rendererParams={countryDelegationRendererParams}
                    />
                </ListView>
            </Container>
            {countryResponse?.icrc_presence?.icrc_presence && (
                <Container
                    empty={false}
                    errored={false}
                    filtered={false}
                    pending={false}
                    className={styles.presenceCard}
                    heading={strings.countryICRCPresenceTitle}
                    footerActions={isDefined(countryResponse.icrc_presence.url) && (
                        <DataDisplay
                            label={strings.source}
                            value={(
                                <Link
                                    styleVariant="action"
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
                    boxShadow="md"
                    withPadding
                    backgroundColor="foreground"
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
                                styleVariant="action"
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
        </ListView>
    );
}

export default Presence;
