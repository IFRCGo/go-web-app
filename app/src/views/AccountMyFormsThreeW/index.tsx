import {
    useContext,
    useMemo,
} from 'react';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createElementColumn,
    createListDisplayColumn,
    createNumberColumn,
    createStringColumn,
    numericIdSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import Link from '#components/Link';
import UserContext from '#contexts/user';
import useFilterState from '#hooks/useFilterState';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import ThreeWTableActions, { type Props as ThreeWTableActionsProps } from './ThreeWTableActions';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ActivitiesResponse = GoApiResponse<'/api/v2/emergency-project/'>;
type ActivityListItem = NonNullable<ActivitiesResponse['results']>[number];

type ProjectsResponse = GoApiResponse<'/api/v2/project/'>;
type ProjectListItem = NonNullable<ProjectsResponse['results']>[number];

type DistrictDetails = ActivityListItem['districts_details'][number];

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
    const { userAuth: userDetails } = useContext(UserContext);
    const {
        page: projectActivePage,
        setPage: setProjectActivePage,
        limit: projectLimit,
        offset: projectOffset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 5,
    });

    const {
        page: activityActivePage,
        setPage: setActivityActivePage,
        limit: activityLimit,
        offset: activityOffset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 5,
    });

    const {
        response: projectResponse,
        pending: projectResponsePending,
    } = useRequest({
        url: '/api/v2/project/',
        preserveResponse: true,
        query: {
            limit: projectLimit,
            offset: projectOffset,
            user: userDetails?.id,
        },
    });

    const {
        response: activityResponse,
        pending: activityResponsePending,
    } = useRequest({
        url: '/api/v2/emergency-project/',
        preserveResponse: true,
        query: {
            limit: activityLimit,
            offset: activityOffset,
            user: userDetails?.id,
        },
    });

    const projectColumns = useMemo(
        () => ([
            createLinkColumn<ProjectListItem, number>(
                'country',
                strings.threeWTableCountry,
                (item) => item.project_country_detail?.name,
                (item) => ({
                    to: 'countryOngoingActivitiesThreeWProjects',
                    urlParams: { countryId: item.project_country },
                }),
            ),
            createStringColumn<ProjectListItem, number>(
                'ns',
                strings.threeWTableNS,
                (item) => item.reporting_ns_detail?.society_name,
            ),
            createLinkColumn<ProjectListItem, number>(
                'name',
                strings.threeWTableProjectName,
                (item) => item.name,
                (item) => ({
                    to: 'threeWProjectDetail',
                    urlParams: { projectId: item.id },
                }),
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
                    projectId,
                }),
            ),
        ]),
        [
            strings.threeWTableCountry,
            strings.threeWTableNS,
            strings.threeWTableProjectName,
            strings.threeWTableSector,
            strings.threeWTableTotalBudget,
            strings.threeWTableProgrammeType,
            strings.threeWTableDisasterType,
            strings.threeWTablePeopleTargeted,
            strings.threeWTablePeopleReached2,
        ],
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
            createLinkColumn<ActivityListItem, number>(
                'title',
                strings.threeWEmergencyTitle,
                (item) => item.title,
                (item) => ({
                    to: 'threeWActivityDetail',
                    urlParams: { activityId: item.id },
                }),
            ),
            createDateColumn<ActivityListItem, number>(
                'start_date',
                strings.threeWEmergencyStartDate,
                (item) => item.start_date,
            ),
            createLinkColumn<ActivityListItem, number>(
                'country',
                strings.threeWEmergencyCountryName,
                (item) => item.country_details?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.id },
                }),
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
                    activityId,
                }),
            ),
        ]),
        [
            strings.threeWNationalSociety,
            strings.threeWEmergencyTitle,
            strings.threeWEmergencyStartDate,
            strings.threeWEmergencyCountryName,
            strings.threeWEmergencyRegion,
            strings.threeWEmergencyStatus,
            strings.threeWEmergencyServices,
        ],
    );

    return (
        <div className={_cs(styles.accountThreeWForms, className)}>
            <Container
                heading={strings.threeWProjects}
                withHeaderBorder
                actions={(
                    <Link
                        to="allThreeWProject"
                        withUnderline
                        withLinkIcon
                    >
                        {strings.threeWViewAllProjectLabel}
                    </Link>
                )}
                footerActions={(
                    <Pager
                        activePage={projectActivePage}
                        onActivePageChange={setProjectActivePage}
                        itemsCount={projectResponse?.count ?? 0}
                        maxItemsPerPage={projectLimit}
                    />
                )}
            >
                <Table
                    pending={projectResponsePending}
                    className={styles.projectTable}
                    data={projectResponse?.results}
                    columns={projectColumns}
                    keySelector={numericIdSelector}
                    filtered={false}
                />
            </Container>
            <Container
                heading={strings.threeWActivities}
                actions={(
                    <Link
                        to="allThreeWActivity"
                        withLinkIcon
                        withUnderline
                    >
                        {strings.threeWViewAllActivityLabel}
                    </Link>
                )}
                withHeaderBorder
                footerActions={(
                    <Pager
                        activePage={activityActivePage}
                        onActivePageChange={setActivityActivePage}
                        itemsCount={activityResponse?.count ?? 0}
                        maxItemsPerPage={activityLimit}
                    />
                )}
            >
                <Table
                    pending={activityResponsePending}
                    className={styles.activityTable}
                    data={activityResponse?.results}
                    columns={activityColumns}
                    keySelector={numericIdSelector}
                    filtered={false}
                />
            </Container>
        </div>
    );
}

Component.displayName = 'AccountThreeWForms';
