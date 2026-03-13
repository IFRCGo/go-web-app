import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    ListView,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import {
    type GoApiResponse,
    useRequest,
    useRiskRequest,
} from '#utils/restRequest';

import PastEventsChart from './PastEventsChart';
import RiskBarChart from './RiskBarChart';
import SeasonalCalender from './SeasonalCalender';

import i18n from './i18n.json';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

type CountryListItem = NonNullable<FieldReportListItem['countries_details']>[number];

const countryKeySelector = (option: CountryListItem) => String(option.id);

const countryLabelSelector = (option: CountryListItem) => option.name ?? '';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { fieldReportId } = useParams<{ fieldReportId: string }>();
    const [countryId, setCountryId] = useState<string | undefined>();

    const {
        pending: fetchingFieldReport,
        response: fieldReportResponse,
    } = useRequest({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field-report/{id}/',
        pathVariables: {
            id: Number(fieldReportId),
        },
    });

    const selectedCountry = fieldReportResponse?.countries_details?.find(
        (country) => String(country.id) === countryId,
    );

    const {
        pending: pendingCountryRiskResponse,
        response: countryRiskResponse,
    } = useRiskRequest({
        apiType: 'risk',
        url: '/api/v1/country-seasonal/',
        query: {
            // FIXME: why do we need to use lowercase?
            iso3: selectedCountry?.iso3?.toLowerCase(),
        },
        skip: !selectedCountry?.iso3,
    });

    // TODO: Verify can we do it without useEffect?
    useEffect(() => {
        if (!countryId && fieldReportResponse?.countries_details?.length === 1) {
            setCountryId(String(fieldReportResponse.countries_details[0]?.id));
        }
    }, [fieldReportResponse, countryId]);

    // NOTE: we always get 1 child in the response
    const riskResponse = countryRiskResponse?.[0];
    const showCountrySelect = (fieldReportResponse?.countries_details?.length ?? 0) > 1;

    const handleCountryChange = useCallback((value: string | undefined) => {
        setCountryId(value);
    }, []);

    return (
        <TabPage
            pending={fetchingFieldReport}
        >
            {showCountrySelect && (
                <ListView>
                    <SelectInput
                        label={strings.selectCountryTitle}
                        name="country"
                        options={fieldReportResponse?.countries_details}
                        value={countryId}
                        onChange={handleCountryChange}
                        keySelector={countryKeySelector}
                        labelSelector={countryLabelSelector}
                    />
                </ListView>
            )}
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
        </TabPage>
    );
}

Component.displayName = 'Background';
