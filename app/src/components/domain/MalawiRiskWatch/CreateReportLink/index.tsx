import { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';
import {
    DISASTER_TYPE_FLOOD,
    type FIELD_REPORT_STATUS_EARLY_WARNING,
    type FIELD_REPORT_STATUS_EVENT,
} from '#utils/constants';
import { getNewFieldReportRouteState } from '#views/FieldReportForm/common';

import { MALAWI_ISO3 } from '../constants';
import {
    type ExternalSource,
    getExternalSourceId,
} from '../useGoFieldReport';
import { type AdminArea } from '../utils';

type ReportStatus = typeof FIELD_REPORT_STATUS_EARLY_WARNING | typeof FIELD_REPORT_STATUS_EVENT;

interface Props {
    source: ExternalSource;
    // Early warning for forecasts, event for observed triggers
    status: ReportStatus;
    label: string;
    pcode: string;
    // Date of the record the report is created from
    recordDate: string;
    adminArea: AdminArea | undefined;
    impact: number | undefined;
    startDate: string;
    title: string;
    description: string;
}

// Prefilled field report for a district flood signal
function CreateReportLink(props: Props) {
    const {
        source,
        status,
        label,
        pcode,
        recordDate,
        adminArea,
        impact,
        startDate,
        title,
        description,
    } = props;

    const { isAuthenticated } = useAuth();
    const { isGuestUser } = usePermissions();
    const malawi = useCountry({ iso3: MALAWI_ISO3 });

    const routeState = useMemo(
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
                    status,
                    country: malawi.id,
                    districts: [district.id],
                    dtype: DISASTER_TYPE_FLOOD,
                    start_date: startDate,
                    title,
                    description,
                    num_potentially_affected: Math.round(impact),
                    // Lets the activation checklist find the report later
                    external_source: source,
                    external_source_id: getExternalSourceId(pcode, recordDate),
                },
                [district],
            );
        },
        [
            malawi,
            adminArea,
            impact,
            status,
            startDate,
            title,
            description,
            source,
            pcode,
            recordDate,
        ],
    );

    if (!isAuthenticated || isGuestUser || isNotDefined(routeState)) {
        return null;
    }

    return (
        <Link
            to="fieldReportFormNew"
            state={routeState}
            styleVariant="filled"
            colorVariant="primary"
            withLinkIcon
        >
            {label}
        </Link>
    );
}

export default CreateReportLink;
