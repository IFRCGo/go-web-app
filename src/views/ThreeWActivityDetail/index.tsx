import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import { PencilFillIcon } from '@ifrc-go/icons';

import Link from '#components/Link';
import Page from '#components/Page';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import TextOutput from '#components/TextOutput';
import List from '#components/List';
import DateOutput from '#components/DateOutput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse, useRequest } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import ActivityListItem, {
    type Props as ActivityListItemProps,
} from './ActivityListItem';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ProjectItem = NonNullable<GoApiResponse<'/api/v2/emergency-project/'>['results']>[number];
type ActivityItem = NonNullable<ProjectItem['activities']>[number];

function simplifiedKeySelector(item: ActivityItem) {
    return item.id;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { activityId } = useParams<{ activityId: string }>();

    const {
        response: emergencyResponse,
        pending: emergencyPending,
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

    const title = emergencyResponse?.title || '--';
    const modifiedAt = emergencyResponse?.modified_at;
    const modifiedBy = emergencyResponse?.modified_by_details;
    const eventName = emergencyResponse?.event_details?.name;
    const countryName = emergencyResponse?.country_details?.name;
    const districtsName = emergencyResponse?.districts_details
        ?.map((district) => district.name)
        .join(', ');
    const startDate = emergencyResponse?.start_date;
    const statusName = emergencyResponse?.status_display;
    const activityLead = emergencyResponse?.activity_lead;
    const activityLeadName = emergencyResponse?.activity_lead_display;

    // activity_lead = deployed_eru
    const eruNationalSocietyName = emergencyResponse?.deployed_eru_details
        ?.eru_owner_details
        ?.national_society_country_details
        ?.society_name;

    // activity_lead = national_society
    const nationalSocietyName = emergencyResponse?.reporting_ns_details.society_name;

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
        maleCount: data.male_count,
        femaleCount: data.female_count,
        peopleCount: data.people_count,
        householdCount: data.household_count,
        peopleHouseholds: data.people_households,
        title: data.action_details?.title,
        customAction: data.custom_action,
        sectorDetails: data.sector_details?.title,
        activityDetails: data.action_details?.title,
        customSupply: data.custom_supplies,
        activitySupply: data.supplies,
        isSimplifiedReport: data.is_simplified_report,

        supplyMapping,
    }), [supplyMapping]);

    return (
        <Page
            title={strings.emergencyDetailsHeading}
            className={styles.emergencyDetails}
            heading={title}
            actions={(
                <Link
                    variant="secondary"
                    to="threeWActivityEdit"
                    urlParams={{ activityId }}
                    icons={<PencilFillIcon />}
                >
                    {strings.emergencyEdit}
                </Link>
            )}
            descriptionContainerClassName={styles.description}
            description={(
                resolveToComponent(
                    strings.emergencyLastModifiedOnTitle,
                    {
                        date: (
                            <DateOutput
                                value={modifiedAt}
                            /> ?? '?'
                        ),
                        user: modifiedBy?.username ?? '?',
                    },
                )
            )}
            mainSectionClassName={styles.main}
        >
            {emergencyPending && <BlockLoading />}
            {!emergencyPending && emergencyResponse && (
                <>
                    <Container
                        className={styles.emergencyThreeWDetails}
                        childrenContainerClassName={styles.operationDetails}
                    >
                        <TextOutput
                            label={strings.emergencyIFRCSupportedOperation}
                            value={eventName}
                            strongLabel
                        />
                        <TextOutput
                            label={strings.emergencyCountry}
                            value={countryName}
                            strongLabel
                        />
                        <TextOutput
                            label={strings.emergencyProvince}
                            value={districtsName}
                            strongLabel
                        />
                        <TextOutput
                            label={strings.emergencyStartDate}
                            value={startDate}
                            valueType="date"
                            strongLabel
                        />
                        <TextOutput
                            label={strings.emergencyStatus}
                            value={statusName}
                            strongLabel
                        />
                        <TextOutput
                            label={strings.emergencyActivityLead}
                            value={activityLeadName}
                            strongLabel
                        />
                        {activityLead === 'deployed_eru' && (
                            <TextOutput
                                label={strings.emergencyERU}
                                value={eruNationalSocietyName}
                                strongLabel
                            />
                        )}
                        {activityLead === 'national_society' && (
                            <TextOutput
                                label={strings.emergencyNationalSociety}
                                value={nationalSocietyName}
                                strongLabel
                            />
                        )}
                    </Container>
                    <Container
                        heading={strings.emergencyActivities}
                        headingLevel={2}
                        withHeaderBorder
                        childrenContainerClassName={styles.activityContent}
                    >
                        <List
                            className={styles.list}
                            data={emergencyResponse?.activities}
                            renderer={ActivityListItem}
                            rendererParams={simplifiedReportListRendererParams}
                            keySelector={simplifiedKeySelector}
                            pending={emergencyPending}
                            errored={false}
                            filtered={false}
                        />
                    </Container>
                </>
            )}
        </Page>
    );
}

Component.displayName = 'ThreeWActivityDetail';
