import { useOutletContext } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import MembershipCoordinationTable from './MembershipCoordinationTable';
import Presence from './Presence';
import SupportingPartnersContacts from './SupportingPartnersContacts';

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
        <TabPage
            wikiLinkPathName="user_guide/Country_Pages#partners"
        >
            <Presence />
            {countryResponse?.has_country_plan && (
                <MembershipCoordinationTable
                    pending={countryPlanPending}
                    membershipData={countryPlanResponse?.membership_coordinations}
                />
            )}
            <SupportingPartnersContacts />
        </TabPage>
    );
}

Component.displayName = 'CountryNsOverviewSupportingPartners';
