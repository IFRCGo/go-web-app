import React, { useMemo } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import {
    MdSearch,
    MdEdit,
} from 'react-icons/md';
import {
    CopyLineIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import Pager from '#components/Pager';
import BlockLoading from '#components/BlockLoading';
import Table from '#components/Table';
import {
    createStringColumn,
    createDateColumn,
    createActionColumn,
    createNumberColumn,
    createListDisplayColumn,
} from '#components/Table/ColumnShortcuts';
import DropdownMenuItem from '#components/DropdownMenuItem';
import ReducedListDisplay from '#components/ReducedListDisplay';
import {
    ListResponse,
    useRequest,
} from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import {
    EmergencyProjectResponse,
    Project,
} from '#types/project.ts';
import { projectKeySelector } from './projectTableColumns';

import i18n from './i18n.json';

import styles from './styles.module.css';

type P = EmergencyProjectResponse;
type K = string | number;

export function getPeopleReachedInActivity(activity: EmergencyProjectResponse['activities'][number]) {
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

export function getPeopleReached(project: EmergencyProjectResponse) {
    const peopleReached = sumSafe(project.activities.map(getPeopleReachedInActivity));

    return peopleReached;
}

const ITEM_PER_PAGE = 5;

interface Props {
    className?: string;
    actionColumnHeaderClassName?: string;
}

function ThreeWList(props: Props) {
    const {
        className,
        actionColumnHeaderClassName,
    } = props;
    const strings = useTranslation(i18n);

    const [projectActivePage, setProjectActivePage] = React.useState(1);
    const [activityActivePage, setActivityActivePage] = React.useState(1);

    const {
        pending: projectPending,
        response: projectResponse,
    } = useRequest<ListResponse<Project>>({
        url: 'api/v2/project/',
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (projectActivePage - 1),
        },
    });

    const {
        pending: activityPending,
        response: activityResponse,
    } = useRequest<ListResponse<EmergencyProjectResponse>>({
        url: 'api/v2/emergency-project/',
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (activityActivePage - 1),
        },
    });

    const projectColumns = useMemo(
        () => {
            const actionsColumn = createActionColumn(
                'actions',
                (rowKey: number | string, prj: Project) => ({
                    extraActions: (
                        <>
                            <DropdownMenuItem
                                href={`/three-w/${prj.id}/`}
                                label={strings.projectListTableViewDetails}
                                icon={<MdSearch />}
                            />
                            <DropdownMenuItem
                                href={`/three-w/${prj.id}/edit/`}
                                icon={<MdEdit />}
                                label={strings.projectListTableEdit}
                            />
                        </>
                    ),
                }),
            );

            return [
                createStringColumn<Project, string | number>(
                    'country',
                    strings.threeWTableCountry,
                    (item) => item.project_country_detail?.name,
                ),
                createStringColumn<Project, string | number>(
                    'ns',
                    strings.threeWTableNS,
                    (item) => item.reporting_ns_detail?.society_name,
                ),
                createStringColumn<Project, string | number>(
                    'name',
                    strings.threeWTableProjectName,
                    (item) => item.name,
                ),
                createStringColumn<Project, string | number>(
                    'sector',
                    strings.threeWTableSector,
                    (item) => item.primary_sector_display,
                ),
                createNumberColumn<Project, string | number>(
                    'budget',
                    strings.threeWTableTotalBudget,
                    (item) => item.budget_amount,
                    undefined,
                ),
                createStringColumn<Project, string | number>(
                    'programmeType',
                    strings.threeWTableProgrammeType,
                    (item) => item.programme_type_display,
                ),
                createStringColumn<Project, string | number>(
                    'disasterType',
                    strings.threeWTableDisasterType,
                    (item) => item.dtype_detail?.name,
                ),
                createNumberColumn<Project, string | number>(
                    'peopleTargeted',
                    strings.threeWTablePeopleTargeted,
                    (item) => item.target_total,
                    undefined,
                ),
                createNumberColumn<Project, string | number>(
                    'peopleReached',
                    strings.threeWTablePeopleReached2,
                    (item) => item.reached_total,
                    undefined,
                ),
                actionsColumn,
            ].filter(isDefined);
        },
        [strings],
    );

    const activityColumns = useMemo(
        () => ([
            createStringColumn<P, K>(
                'national_society_eru',
                'National Society / ERU',
                (item) => (
                    item.activity_lead === 'deployed_eru'
                        ? item.deployed_eru_details
                            ?.eru_owner_details
                            ?.national_society_country_details
                            ?.society_name
                        : item.reporting_ns_details?.society_name
                ),
            ),
            createStringColumn<P, K>(
                'title',
                'Title',
                (item) => item.title,
            ),
            createDateColumn<P, K>(
                'start_date',
                'Start date',
                (item) => item.start_date,
            ),
            createStringColumn<P, K>(
                'country',
                'Country',
                (item) => item.country_details?.name,
            ),
            // createStringColumn<P, K>(
            //     'districts',
            //     'Province/Region',
            //     // TODO: fix typecast
            //     (item) => (
            //         <ReducedListDisplay
            //             value={item.districts_details?.map(d => d.name)}
            //             title="Province / Region"
            //         />
            //     ),
            // ),
            createListDisplayColumn<P, K>(
                'districts',
                'Province/Region',
                (item) => (
                    <ReducedListDisplay
                        value={item.length > 0 ? item.districts_details.map(d => d.name) : undefined}
                        title="Province / Region"
                    />
                ),
            ),
            createStringColumn<P, K>(
                'status',
                'Status',
                (item) => item.status_display,
            ),
            createNumberColumn<P, K>(
                'people_reached',
                'Services provided to people in need', // People Reached
                (item) => getPeopleReached(item),
            ),
            createActionColumn(
                'project_actions',
                (rowKey: number | string, p: EmergencyProjectResponse) => ({
                    extraActions: (
                        <>
                            <DropdownMenuItem
                                href={`/emergency-three-w/${rowKey}/`}
                                icon={<ShareBoxLineIcon />}
                                label="View Details"
                            />
                            <DropdownMenuItem
                                href={`/emergency-three-w/${rowKey}/edit/`}
                                icon={<PencilFillIcon />}
                                label="Edit"
                            />
                            <DropdownMenuItem
                                href={`/three-w/new/`}
                                icon={<CopyLineIcon />}
                                label="Duplicate"
                                state={{
                                    initialValue: p,
                                    operationType: 'response_activity',
                                }}
                            />
                        </>
                    ),
                }),
                { headerContainerClassName: _cs(styles.actionColumn, actionColumnHeaderClassName) },
            ),
        ]),
        [],
    );

    const pending = projectPending || activityPending;

    return (
        <Container
            className={_cs(styles.threeWList, className)}
            childrenContainerClassName={styles.mainContent}
        >
            {pending && <BlockLoading />}
            {!pending && projectResponse && (
                <Container
                    heading={strings.threeWProjects}
                    withHeaderBorder
                    footerActions={(
                        <Pager
                            activePage={projectActivePage}
                            onActivePageChange={setProjectActivePage}
                            itemsCount={projectResponse.count}
                            maxItemsPerPage={ITEM_PER_PAGE}
                        />
                    )}
                >
                    <Table
                        className={styles.projectTable}
                        data={projectResponse.results}
                        columns={projectColumns}
                        keySelector={projectKeySelector}
                    />
                </Container>
            )}
            {!pending && activityResponse && (
                <Container
                    heading={strings.threeWActivities}
                    withHeaderBorder
                    footerActions={(
                        <Pager
                            activePage={activityActivePage}
                            onActivePageChange={setActivityActivePage}
                            itemsCount={activityResponse.count}
                            maxItemsPerPage={ITEM_PER_PAGE}
                        />
                    )}
                >
                    <Table
                        className={styles.activityTable}
                        data={activityResponse.results}
                        columns={activityColumns}
                        keySelector={(d) => d.id}
                    />
                </Container>
            )}
        </Container>
    );
}

export default ThreeWList;
