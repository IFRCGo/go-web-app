import { useCallback, useContext } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { PencilFillIcon } from '@ifrc-go/icons';

import Link from '#components/Link';
import Page from '#components/Page';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import TextOutput from '#components/TextOutput';
import RouteContext from '#contexts/route';
import List from '#components/List';
import DateOutput from '#components/DateOutput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse, useRequest } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import { components } from '#generated/types';
import ActivityListItem, {
    type Props as ActivityListItemProps,
} from './ActivityListItem';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ActivityLeadEnum = components['schemas']['ActivityLeadEnum'];
const ACTIVITY_LEADER_NS = 'national_society' satisfies ActivityLeadEnum;
const ACTIVITY_LEADER_ERU = 'deployed_eru' satisfies ActivityLeadEnum;

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
        threeWActivityEdit: threeWActivityEditRoute,
    } = useContext(RouteContext);

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
    }), []);

    return (
        <Page
            title={strings.emergencyDetailsHeading}
            className={styles.emergencyDetails}
            heading={emergencyResponse?.title}
            actions={(
                <Link
                    variant="secondary"
                    to={generatePath(
                        threeWActivityEditRoute.absolutePath,
                        { activityId },
                    )}
                    icons={<PencilFillIcon />}
                >
                    {strings.emergencyEdit}
                </Link>
            )}
            descriptionContainerClassName={styles.description}
            description={(
                <TextOutput
                    valueClassName={styles.modifiedOnValue}
                    label={strings.emergencyLastModifiedOnTitle}
                    withoutLabelColon
                    strongLabel
                    value={(
                        <>
                            {resolveToComponent(strings.emergencyLastModifiedDetail, {
                                date: (
                                    <DateOutput
                                        value={emergencyResponse?.modified_at}
                                    />
                                ),
                            })}
                            {isDefined(emergencyResponse?.modified_by_details) && (
                                resolveToComponent(strings.emergencyLastModifiedDetailByUser, {
                                    user: emergencyResponse?.modified_by_details?.username,
                                })
                            )}
                        </>
                    )}
                />
            )}
        >
            {emergencyPending && <BlockLoading />}
            {!emergencyPending && emergencyResponse && (
                <Container
                    className={styles.emergencyThreeWDetails}
                    childrenContainerClassName={styles.operationDetails}
                >
                    <TextOutput
                        label={strings.emergencyIFRCSupportedOperation}
                        value={emergencyResponse?.event_details?.name}
                        strongLabel
                    />
                    <TextOutput
                        label={strings.emergencyCountry}
                        value={emergencyResponse?.country_details?.name}
                        strongLabel
                    />
                    <TextOutput
                        label={strings.emergencyProvince}
                        value={emergencyResponse?.districts_details?.map((district) => district.name)?.join(', ')}
                        strongLabel
                    />
                    <TextOutput
                        label={strings.emergencyStartDate}
                        value={emergencyResponse?.start_date}
                        valueType="date"
                        strongLabel
                    />
                    <TextOutput
                        label={strings.emergencyStatus}
                        value={emergencyResponse?.status_display}
                        strongLabel
                    />
                    <TextOutput
                        label={strings.emergencyActivityLead}
                        value={emergencyResponse?.activity_lead_display}
                        strongLabel
                    />
                    {emergencyResponse?.activity_lead === ACTIVITY_LEADER_ERU && (
                        <TextOutput
                            label={strings.emergencyERU}
                            value={emergencyResponse?.deployed_eru_details
                                ?.eru_owner_details?.national_society_country_details?.society_name}
                            strongLabel
                        />
                    )}
                    {emergencyResponse?.activity_lead === ACTIVITY_LEADER_NS && (
                        <TextOutput
                            label={strings.emergencyNationalSociety}
                            value={emergencyResponse?.reporting_ns_details.society_name}
                            strongLabel
                        />
                    )}
                    <Container
                        heading={strings.emergencyActivities}
                        headingLevel={2}
                        withHeaderBorder
                        childrenContainerClassName={styles.activityContent}
                    >
                        <List
                            data={emergencyResponse?.activities}
                            renderer={ActivityListItem}
                            rendererParams={simplifiedReportListRendererParams}
                            keySelector={simplifiedKeySelector}
                            pending={emergencyPending}
                            errored={false}
                            filtered={false}
                        />
                    </Container>
                </Container>
            )}
        </Page>
    );
}

Component.displayName = 'ThreeWActivityDetail';
