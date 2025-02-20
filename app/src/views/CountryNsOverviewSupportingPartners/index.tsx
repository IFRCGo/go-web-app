import { useOutletContext } from 'react-router-dom';
import { Container } from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';

import WikiLink from '#components/WikiLink';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import MembershipCoordinationTable from './MembershipCoordinationTable';
import Presence from './Presence';
import SupportingPartnersContacts from './SupportingPartnersContacts';

import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
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
        <Container
            className={styles.countryProfileSupportingPartners}
            contentViewType="vertical"
            spacing="loose"
            actions={(
                <WikiLink
                    href="user_guide/Country_Pages#partners"
                />
            )}
        >
            <Presence />
            {countryResponse?.has_country_plan && (
                <MembershipCoordinationTable
                    pending={countryPlanPending}
                    membershipData={countryPlanResponse?.membership_coordinations}
                />
            )}
            <SupportingPartnersContacts />
        </Container>
    );
}

Component.displayName = 'CountryNsOverviewSupportingPartners';
