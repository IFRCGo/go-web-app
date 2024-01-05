import { useOutletContext } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';
import Link from '#components/Link';

import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { type CountryOutletContext } from '#utils/outletContext';

import MembershipCoordinationTable from './MembershipCoordinationTable';
import SupportingPartnersContacts from './SupportingPartnersContacts';
import PresenceItem from './PresenceItem';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        countryId,
        countryResponse,
    } = useOutletContext<CountryOutletContext>();

    const {
        pending: countryPlanPending,
        response: countryPlanResponse,
    } = useRequest({
        // FIXME: need to check if countryId can be ''
        skip: isNotDefined(countryId) || !countryResponse?.has_country_plan,
        url: '/api/v2/country-plan/{country}/',
        pathVariables: {
            country: Number(countryId),
        },
    });

    return (
        <div className={styles.countryProfileSupportingPartners}>
            {/* TODO: This is just temporary link, and should be removed */}
            <Link
                href={countryResponse?.url_ifrc}
                external
                variant="secondary"
                withLinkIcon
            >
                {strings.gotoIfrcLinkLabel}
            </Link>
            <PresenceItem />
            {countryResponse?.has_country_plan && (
                <MembershipCoordinationTable
                    pending={countryPlanPending}
                    membershipData={countryPlanResponse?.membership_coordinations}
                />
            )}
            <SupportingPartnersContacts />
        </div>
    );
}

Component.displayName = 'CountryProfileSupportingPartners';
