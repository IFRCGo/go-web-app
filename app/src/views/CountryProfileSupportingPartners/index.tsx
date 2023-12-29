import { useOutletContext } from 'react-router-dom';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import MembershipCoordinationTable from './MembershipCoordinationTable';
import Presence from './Presence';
import SupportingPartnersContacts from './SupportingPartnersContacts';

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
            <Presence />
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
