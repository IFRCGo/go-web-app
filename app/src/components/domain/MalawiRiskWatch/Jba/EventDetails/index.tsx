import { useMemo } from 'react';
import {
    Container,
    InfoPopup,
    KeyFigure,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    formatNumber,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';
import Link from '#components/Link';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';
import {
    DISASTER_TYPE_FLOOD,
    FIELD_REPORT_STATUS_EARLY_WARNING,
} from '#utils/constants';
import { getNewFieldReportRouteState } from '#views/FieldReportForm/common';

import { MALAWI_ISO3 } from '../../constants';
import {
    impactSelector,
    type JbaDistrictEvent,
} from '../utils';
import TrajectoryChart from './TrajectoryChart';

import i18n from './i18n.json';

type Props = RiskEventDetailProps<JbaDistrictEvent, undefined>;

function EventDetails(props: Props) {
    const {
        data,
        children,
    } = props;

    const strings = useTranslation(i18n);
    const { isAuthenticated } = useAuth();
    const { isGuestUser } = usePermissions();
    const malawi = useCountry({ iso3: MALAWI_ISO3 });

    const { activeRow, adminArea } = data;
    const impact = impactSelector(activeRow);

    const reportRouteState = useMemo(
        () => {
            if (isNotDefined(malawi) || isNotDefined(adminArea) || isNotDefined(impact)) {
                return undefined;
            }
            const district = {
                id: adminArea.district_id,
                name: adminArea.district_name,
            };
            return getNewFieldReportRouteState(
                {
                    status: FIELD_REPORT_STATUS_EARLY_WARNING,
                    country: malawi.id,
                    districts: [district.id],
                    dtype: DISASTER_TYPE_FLOOD,
                    start_date: activeRow.forecastTargetDate,
                    title: resolveToString(
                        strings.jbaEventDetailsReportTitle,
                        { district: data.name },
                    ),
                    description: resolveToString(
                        strings.jbaEventDetailsReportDescription,
                        {
                            issueDate: formatDate(activeRow.forecastIssueDate) ?? '',
                            impact: formatNumber(Math.round(impact)) ?? '',
                            district: data.name,
                            leadTime: activeRow.leadTimeDays,
                            targetDate: formatDate(activeRow.forecastTargetDate) ?? '',
                        },
                    ),
                    num_potentially_affected: Math.round(impact),
                },
                [district],
            );
        },
        [malawi, adminArea, impact, activeRow, data.name, strings],
    );

    return (
        <Container>
            <ListView
                layout="block"
                spacing="sm"
            >
                <TextOutput
                    label={strings.jbaEventDetailsTargetDate}
                    value={activeRow.forecastTargetDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                <Container
                    heading={strings.jbaEventDetailsPopulationImpacted}
                    headingLevel={5}
                    headerActions={(
                        <InfoPopup
                            title={strings.jbaEventDetailsPopulationImpacted}
                            description={strings.jbaEventDetailsPopulationImpactedInfo}
                        />
                    )}
                >
                    <KeyFigure
                        value={impact}
                        valueType="number"
                        valueOptions={{ maximumFractionDigits: 0 }}
                    />
                </Container>
                {data.rows.length > 1 && (
                    <Container
                        heading={strings.jbaEventDetailsTrajectoryHeading}
                        headingLevel={5}
                        headerActions={(
                            <InfoPopup
                                title={strings.jbaEventDetailsTrajectoryHeading}
                                description={strings.jbaEventDetailsTrajectoryInfo}
                            />
                        )}
                    >
                        <TrajectoryChart
                            rows={data.rows}
                            activeLeadTimeDays={activeRow.leadTimeDays}
                        />
                    </Container>
                )}
                {isAuthenticated && !isGuestUser && isDefined(reportRouteState) && (
                    <Link
                        to="fieldReportFormNew"
                        state={reportRouteState}
                        styleVariant="outline"
                        colorVariant="primary"
                        withLinkIcon
                    >
                        {strings.jbaEventDetailsCreateReport}
                    </Link>
                )}
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
