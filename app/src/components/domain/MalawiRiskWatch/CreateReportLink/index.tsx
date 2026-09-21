import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';
import {
    DISASTER_TYPE_FLOOD,
    FIELD_REPORT_STATUS_EARLY_WARNING,
} from '#utils/constants';
import { getNewFieldReportRouteState } from '#views/FieldReportForm/common';

import { MALAWI_ISO3 } from '../constants';
import { type AdminArea } from '../utils';

import i18n from './i18n.json';

interface Props {
    adminArea: AdminArea | undefined;
    impact: number | undefined;
    startDate: string;
    title: string;
    description: string;
}

// Prefilled early warning report for a district flood signal
function CreateReportLink(props: Props) {
    const {
        adminArea,
        impact,
        startDate,
        title,
        description,
    } = props;

    const strings = useTranslation(i18n);
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
                    status: FIELD_REPORT_STATUS_EARLY_WARNING,
                    country: malawi.id,
                    districts: [district.id],
                    dtype: DISASTER_TYPE_FLOOD,
                    start_date: startDate,
                    title,
                    description,
                    num_potentially_affected: Math.round(impact),
                },
                [district],
            );
        },
        [malawi, adminArea, impact, startDate, title, description],
    );

    if (!isAuthenticated || isGuestUser || isNotDefined(routeState)) {
        return null;
    }

    return (
        <Link
            to="fieldReportFormNew"
            state={routeState}
            styleVariant="outline"
            colorVariant="primary"
            withLinkIcon
        >
            {strings.createReportLinkLabel}
        </Link>
    );
}

export default CreateReportLink;
