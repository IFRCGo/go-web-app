import { useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import {
    createStringColumn,
    createDateColumn,
    createNumberColumn,
    createListDisplayColumn,
    createElementColumn,
} from '#components/Table/ColumnShortcuts';
import { useRequest } from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import type { paths } from '#generated/types';

import ThreeWTableActions from './ThreeWTableActions';
import type { Props as ThreeWTableActionsProps } from './ThreeWTableActions';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetActivities = paths['/api/v2/emergency-project/']['get'];
type ActivitiesResponse = GetActivities['responses']['200']['content']['application/json'];
type ActivityListItem = NonNullable<ActivitiesResponse['results']>[number];

type GetProjects = paths['/api/v2/project/']['get'];
type ProjectsResponse = GetProjects['responses']['200']['content']['application/json'];
type ProjectListItem = NonNullable<ProjectsResponse['results']>[number];

type DistrictDetails = ActivityListItem['districts_details'][number];

function idSelector(p: { id: number }) {
    return p.id;
}

function getPeopleReachedInActivity(activity: NonNullable<ActivityListItem['activities']>[number]) {
    const {
        is_simplified_report,

        people_count,
        male_0_1_count,
        male_2_5_count,
        male_6_12_count,
        male_13_17_count,
        male_18_59_count,
        male_60_plus_count,
        male_unknown_age_count,

        female_0_1_count,
        female_2_5_count,
        female_6_12_count,
        female_13_17_count,
        female_18_59_count,
        female_60_plus_count,
        female_unknown_age_count,

        other_0_1_count,
        other_2_5_count,
        other_6_12_count,
        other_13_17_count,
        other_18_59_count,
        other_60_plus_count,
        other_unknown_age_count,
    } = activity;

    if (is_simplified_report === true) {
        return people_count ?? 0;
    }

    if (is_simplified_report === false) {
        return sumSafe([
            male_0_1_count,
            male_2_5_count,
            male_6_12_count,
            male_13_17_count,
            male_18_59_count,
            male_60_plus_count,
            male_unknown_age_count,

            female_0_1_count,
            female_2_5_count,
            female_6_12_count,
            female_13_17_count,
            female_18_59_count,
            female_60_plus_count,
            female_unknown_age_count,

            other_0_1_count,
            other_2_5_count,
            other_6_12_count,
            other_13_17_count,
            other_18_59_count,
            other_60_plus_count,
            other_unknown_age_count,
        ]);
    }

    return undefined;
}

function getPeopleReached(activity: ActivityListItem) {
    const peopleReached = sumSafe(activity?.activities?.map(getPeopleReachedInActivity));

    return peopleReached;
}

const ITEM_PER_PAGE = 5;

function DistrictNameOutput({ districtName }: { districtName: string }) {
    return districtName;
}

interface Props {
    className?: string;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const [projectActivePage, setProjectActivePage] = useState(1);
    const [activityActivePage, setActivityActivePage] = useState(1);

    const {
        response: projectResponse,
        pending: projectResponsePending,
    } = useRequest<ProjectsResponse>({
        url: 'api/v2/project/',
        preserveResponse: true,
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (projectActivePage - 1),
        },
    });

    const {
        response: activityResponse,
        pending: activityResponsePending,
    } = useRequest<ActivitiesResponse>({
        url: 'api/v2/emergency-project/',
        preserveResponse: true,
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (activityActivePage - 1),
        },
    });

    const projectColumns = useMemo(
        () => ([
            createStringColumn<ProjectListItem, number>(
                'country',
                strings.threeWTableCountry,
                (item) => item.project_country_detail?.name,
            ),
            createStringColumn<ProjectListItem, number>(
                'ns',
                strings.threeWTableNS,
                (item) => item.reporting_ns_detail?.society_name,
            ),
            createStringColumn<ProjectListItem, number>(
                'name',
                strings.threeWTableProjectName,
                (item) => item.name,
            ),
            createStringColumn<ProjectListItem, number>(
                'sector',
                strings.threeWTableSector,
                (item) => item.primary_sector_display,
            ),
            createNumberColumn<ProjectListItem, number>(
                'budget',
                strings.threeWTableTotalBudget,
                (item) => item.budget_amount,
                undefined,
            ),
            createStringColumn<ProjectListItem, number>(
                'programmeType',
                strings.threeWTableProgrammeType,
                (item) => item.programme_type_display,
            ),
            createStringColumn<ProjectListItem, number>(
                'disasterType',
                strings.threeWTableDisasterType,
                (item) => item.dtype_detail?.name,
            ),
            createNumberColumn<ProjectListItem, number>(
                'peopleTargeted',
                strings.threeWTablePeopleTargeted,
                (item) => item.target_total,
                undefined,
            ),
            createNumberColumn<ProjectListItem, number>(
                'peopleReached',
                strings.threeWTablePeopleReached2,
                (item) => item.reached_total,
                undefined,
            ),
            createElementColumn<ProjectListItem, number, ThreeWTableActionsProps>(
                'actions',
                '',
                ThreeWTableActions,
                (projectId) => ({
                    type: 'project',
                    threeWId: projectId,
                }),
            ),
        ]),
        [strings],
    );

    const activityColumns = useMemo(
        () => ([
            createStringColumn<ActivityListItem, number>(
                'national_society_eru',
                strings.threeWNationalSociety,
                (item) => (
                    item.activity_lead === 'deployed_eru'
                        ? item.deployed_eru_details
                            ?.eru_owner_details
                            ?.national_society_country_details
                            ?.society_name
                        : item.reporting_ns_details?.society_name
                ),
            ),
            createStringColumn<ActivityListItem, number>(
                'title',
                strings.threeWEmergencyTitle,
                (item) => item.title,
            ),
            createDateColumn<ActivityListItem, number>(
                'start_date',
                strings.threeWEmergencyStartDate,
                (item) => item.start_date,
            ),
            createStringColumn<ActivityListItem, number>(
                'country',
                strings.threeWEmergencyCountryName,
                (item) => item.country_details?.name,
            ),
            createListDisplayColumn<
                ActivityListItem,
                number,
                DistrictDetails,
                { districtName: string }
            >(
                'districts',
                strings.threeWEmergencyRegion,
                (activity) => ({
                    list: activity.districts_details,
                    renderer: DistrictNameOutput,
                    rendererParams: (districtDetail) => ({ districtName: districtDetail.name }),
                    keySelector: (districtDetail) => districtDetail.id,
                }),
            ),
            createStringColumn<ActivityListItem, number>(
                'status',
                strings.threeWEmergencyStatus,
                (item) => item.status_display,
            ),
            createNumberColumn<ActivityListItem, number>(
                'people_reached',
                strings.threeWEmergencyServices, // People Reached
                (item) => getPeopleReached(item),
            ),
            createElementColumn<
                ActivityListItem,
                number,
                ThreeWTableActionsProps
            >(
                'actions',
                '',
                ThreeWTableActions,
                (activityId) => ({
                    type: 'activity',
                    threeWId: activityId,
                }),
            ),
        ]),
        [strings],
    );

    return (
        <Container
            className={_cs(styles.threeWList, className)}
            childrenContainerClassName={styles.mainContent}
        >
            <Container
                heading={strings.threeWProjects}
                withHeaderBorder
                footerActions={(
                    <Pager
                        activePage={projectActivePage}
                        onActivePageChange={setProjectActivePage}
                        itemsCount={projectResponse?.count ?? 0}
                        maxItemsPerPage={ITEM_PER_PAGE}
                    />
                )}
            >
                <Table
                    pending={projectResponsePending}
                    className={styles.projectTable}
                    data={projectResponse?.results}
                    columns={projectColumns}
                    keySelector={idSelector}
                    filtered={false}
                />
            </Container>
            <Container
                heading={strings.threeWActivities}
                withHeaderBorder
                footerActions={(
                    <Pager
                        activePage={activityActivePage}
                        onActivePageChange={setActivityActivePage}
                        itemsCount={activityResponse?.count ?? 0}
                        maxItemsPerPage={ITEM_PER_PAGE}
                    />
                )}
            >
                <Table
                    pending={activityResponsePending}
                    className={styles.activityTable}
                    data={activityResponse?.results}
                    columns={activityColumns}
                    keySelector={idSelector}
                    filtered={false}
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'AccountThreeWFroms';
