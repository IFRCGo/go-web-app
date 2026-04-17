import { useRiskRequest } from '#utils/restRequest';

import PastEventsChart from './PastEventsChart';
import RiskBarChart from './RiskBarChart';
import SeasonalCalender from './SeasonalCalender';

interface Props {
    countryId: string | undefined;
    countryIso3?: string | undefined;
}

function RiskAnalysis({ countryId, countryIso3 }: Props) {
    const {
        pending: pendingCountryRiskResponse,
        response: countryRiskResponse,
    } = useRiskRequest({
        apiType: 'risk',
        url: '/api/v1/country-seasonal/',
        query: {
            iso3: countryIso3?.toLowerCase(),
        },
        skip: !countryIso3,
    });

    const riskResponse = countryRiskResponse?.[0];

    return (
        <>
            <PastEventsChart
                countryId={countryId}
            />
            <SeasonalCalender
                countryId={countryId}
            />
            <RiskBarChart
                pending={pendingCountryRiskResponse}
                seasonalRiskData={riskResponse}
            />
        </>
    );
}

export default RiskAnalysis;
