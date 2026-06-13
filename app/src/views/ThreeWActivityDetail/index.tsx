import {
    useCallback,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    Container,
    DataDisplay,
    DateDisplay,
    ListView,
    Message,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import DetailsFailedToLoadMessage from '#components/domain/DetailsFailedToLoadMessage';
import Link from '#components/Link';
import Page from '#components/Page';
import { getUserName } from '#utils/domain/user';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import ActivityListItem, { type Props as ActivityListItemProps } from './ActivityListItem';

import i18n from './i18n.json';

type ProjectItem = NonNullable<GoApiResponse<'/api/v2/emergency-project/'>['results']>[number];
type ActivityItem = NonNullable<ProjectItem['activities']>[number];

function simplifiedKeySelector(item: ActivityItem) {
    return item.id;
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { activityId } = useParams<{ activityId: string }>();

    const {
        pending: fetchingActivity,
        response: activityResponse,
        error: activityResponseError,
    } = useRequest({
        skip: isNotDefined(activityId),
        url: '/api/v2/emergency-project/{id}/',
        pathVariables: isDefined(activityId) ? {
            id: Number(activityId),
        } : undefined,
    });

    const {
        response: optionsResponse,
    } = useRequest({
        url: '/api/v2/emergency-project/options/',
    });

    const heading = activityResponse?.title || strings.activityHeading;
    const modifiedAt = activityResponse?.modified_at;
    const modifiedBy = activityResponse?.modified_by_details;
    const eventId = activityResponse?.event;
    const eventName = activityResponse?.event_details?.name;
    const countryId = activityResponse?.country;
    const countryName = activityResponse?.country_details?.name;
    const districtsName = activityResponse?.districts_details
        ?.map((district) => district.name)
        .join(', ');
    const startDate = activityResponse?.start_date;
    const statusName = activityResponse?.status_display;
    const activityLead = activityResponse?.activity_lead;
    const activityLeadName = activityResponse?.activity_lead_display;

    // activity_lead = deployed_eru
    const eruNationalSocietyName = activityResponse?.deployed_eru_details
        ?.eru_owner_details
        ?.national_society_country_details
        ?.society_name;

    // activity_lead = national_society
    const nationalSocietyName = activityResponse?.reporting_ns_details?.society_name;

    const supplyMapping = useMemo(() => (
        listToMap(
            optionsResponse?.actions?.flatMap(
                (detail) => detail.supplies_details,
            ).filter(isDefined),
            (detail) => detail.id,
            (detail) => detail,
        )
    ), [optionsResponse?.actions]);

    const simplifiedReportListRendererParams = useCallback((
        _: number,
        data: ActivityItem,
    ): ActivityListItemProps => ({
        activityItem: data,
        supplyMapping,
    }), [supplyMapping]);

    const shouldHideDetails = fetchingActivity
        || isDefined(activityResponseError);

    return (
        <Page
            title={strings.activityPageTitle}
            heading={heading}
            actions={(
                <Link
                    colorVariant="primary"
                    styleVariant="outline"
                    to="threeWActivityEdit"
                    urlParams={{ activityId }}
                    before={<PencilFillIcon />}
                    disabled={shouldHideDetails}
                >
                    {strings.emergencyEdit}
                </Link>
            )}
            description={!shouldHideDetails && (
                resolveToComponent(
                    strings.emergencyLastModifiedOnTitle,
                    {
                        date: (
                            <DateDisplay
                                value={modifiedAt}
                            />
                        ),
                        user: getUserName(modifiedBy),
                    },
                )
            )}
        >
            {fetchingActivity && (
                <Message
                    pending
                />
            )}
            {isDefined(activityResponseError) && (
                <DetailsFailedToLoadMessage
                    description={activityResponseError.value.messageForNotification}
                />
            )}
            {!shouldHideDetails && (
                <>
                    <Container>
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                        >
                            <DataDisplay
                                label={strings.emergencyIFRCSupportedOperation}
                                value={(
                                    <Link
                                        to="emergencyDetails"
                                        urlParams={{ emergencyId: eventId }}
                                        withUnderline
                                    >
                                        {eventName}
                                    </Link>
                                )}
                                strongLabel
                            />
                            <DataDisplay
                                label={strings.emergencyCountry}
                                value={(
                                    <Link
                                        to="countriesLayout"
                                        urlParams={{ countryId }}
                                        withUnderline
                                    >
                                        {countryName}
                                    </Link>
                                )}
                                strongLabel
                            />
                            <DataDisplay
                                label={strings.emergencyProvince}
                                value={districtsName}
                                strongLabel
                            />
                            <DataDisplay
                                label={strings.emergencyStartDate}
                                value={startDate}
                                valueType="date"
                                strongLabel
                            />
                            <DataDisplay
                                label={strings.emergencyStatus}
                                value={statusName}
                                strongLabel
                            />
                            <DataDisplay
                                label={strings.emergencyActivityLead}
                                value={activityLeadName}
                                strongLabel
                            />
                            {activityLead === 'deployed_eru' && (
                                <DataDisplay
                                    label={strings.emergencyERU}
                                    value={eruNationalSocietyName}
                                    strongLabel
                                />
                            )}
                            {activityLead === 'national_society' && (
                                <DataDisplay
                                    label={strings.emergencyNationalSociety}
                                    value={nationalSocietyName}
                                    strongLabel
                                />
                            )}
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.emergencyActivities}
                        withHeaderBorder
                        pending={fetchingActivity}
                    >
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                        >
                            <RawList
                                data={activityResponse?.activities}
                                renderer={ActivityListItem}
                                rendererParams={simplifiedReportListRendererParams}
                                keySelector={simplifiedKeySelector}
                            />
                        </ListView>
                    </Container>
                </>
            )}
        </Page>
    );
}

Component.displayName = 'ThreeWActivityDetail';
