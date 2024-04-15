import {
    useCallback,
    useMemo,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Container,
    ExpandableContainer,
    KeyFigure,
    List,
    PieChart,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateRangeColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
    numericIdSelector,
    numericValueSelector,
    resolveToString,
    stringLabelSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import { unparse } from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import ProjectActions, { Props as ProjectActionsProps } from '#components/domain/ProjectActions';
import Link from '#components/Link';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { PROJECT_STATUS_ONGOING } from '#utils/constants';
import type { CountryOutletContext } from '#utils/outletContext';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import Filter, { FilterValue } from './Filters';
import Map from './Map';
import NationalSocietyDirectoryInitiatives from './NsDirectoryInitiatives';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface LabelValue {
    label: string;
    value: number;
}

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];
type ProjectKey = 'project_country' | 'operation_type' | 'programme_type' | 'primary_sector' | 'secondary_sectors';
const emptyProjectList: Project[] = [];

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function filterProjects(projectList: Project[], filters: Partial<Record<ProjectKey, number[]>>) {
    return projectList.filter((project) => (
        Object.entries(filters).every(([filterKey, filterValue]) => {
            const projectValue = project[filterKey as ProjectKey];

            if (isNotDefined(filterValue) || filterValue.length === 0) {
                return true;
            }

            if (isNotDefined(projectValue)) {
                return false;
            }

            if (Array.isArray(projectValue)) {
                return projectValue.some((v) => filterValue.includes(v));
            }

            return filterValue.includes(projectValue);
        })
    ));
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        countryResponse,
        countryResponsePending,
    } = useOutletContext<CountryOutletContext>();

    const {
        rawFilter,
        filter,
        filtered,
        setFilterField,
    } = useFilterState<FilterValue>({
        filter: {},
    });

    const {
        pending: projectListPending,
        response: projectListResponse,
        retrigger: reTriggerProjectListRequest,
    } = useRequest({
        skip: isNotDefined(countryResponse?.id),
        url: '/api/v2/project/',
        query: {
            limit: 9999,
            reporting_ns: isDefined(countryResponse) ? [countryResponse.id] : undefined,
        },
    });

    const projectList = projectListResponse?.results ?? emptyProjectList;
    const filteredProjectList = filterProjects(projectList, filter);

    const {
        ongoingProjects,
        targetedPopulation,
        ongoingProjectBudget,
        programmeTypeStats,
        projectStatusTypeStats,
        countryCountWithNSProjects,
    } = useMemo(() => {
        const projectsOngoing = filteredProjectList
            .filter((p) => p.status === PROJECT_STATUS_ONGOING);

        const ongoingBudget = sumSafe(projectsOngoing?.map((d) => d.budget_amount)) ?? 0;

        const peopleTargeted = sumSafe(filteredProjectList?.map((d) => d.target_total)) ?? 0;

        const programmeTypeGrouped = (
            listToGroupList(
                filteredProjectList,
                (d) => d.programme_type_display,
                (d) => d,
            ) ?? {}
        );

        const programmeTypes: LabelValue[] = mapToList(
            programmeTypeGrouped,
            (d, k) => ({ label: String(k), value: d.length }),
        );

        const statusGrouped = (
            listToGroupList(
                filteredProjectList,
                (d) => d.status_display,
                (d) => d,
            ) ?? {}
        );

        const projectStatusTypes: LabelValue[] = mapToList(
            statusGrouped,
            (d, k) => ({ label: String(k), value: d.length }),
        );

        const numCountriesWithNSProjects = unique(projectsOngoing, (d) => d.project_country).length;

        return {
            ongoingProjects: projectsOngoing,
            targetedPopulation: peopleTargeted,
            ongoingProjectBudget: ongoingBudget,
            programmeTypeStats: programmeTypes,
            projectStatusTypeStats: projectStatusTypes,
            countryCountWithNSProjects: numCountriesWithNSProjects,
        };
    }, [filteredProjectList]);

    const countryGroupedProjects = useMemo(() => (
        listToGroupList(ongoingProjects, (project) => project.project_country)
    ), [ongoingProjects]);

    const tableColumns = useMemo(() => ([
        createStringColumn<Project, number>(
            'countries',
            strings.nSTableCountries,
            (item) => item.project_country_detail.name,
            { columnClassName: styles.countries },
        ),
        createDateRangeColumn<Project, number>(
            'startDate',
            strings.nSStartDate,
            (item) => ({
                startDate: item.start_date,
                endDate: item.end_date,
            }),
        ),
        createStringColumn<Project, number>(
            'disasterType',
            strings.nSTableDisasterType,
            (item) => item.dtype_detail?.name,
        ),
        createStringColumn<Project, number>(
            'sector',
            strings.nSTableSector,
            (item) => item.primary_sector_display,
        ),
        createStringColumn<Project, number>(
            'name',
            strings.nSTableProjectName,
            (item) => item.name,
        ),

        createNumberColumn<Project, number>(
            'budget',
            strings.nSTableTotalBudget,
            (item) => item.budget_amount,
            undefined,
        ),
        createNumberColumn<Project, number>(
            'peopleTargeted',
            strings.nSTablePeopleTargeted,
            (item) => item.target_total,
            undefined,
        ),
        createNumberColumn<Project, number>(
            'peopleReached',
            strings.nSTablePeopleReached,
            (item) => item.reached_total,
            undefined,
        ),
        createStringColumn<Project, number>(
            'contact',
            strings.nSContactPerson,
            (item) => ([
                item.reporting_ns_contact_name,
                item.reporting_ns_contact_email,
            ].filter(isDefined).join(', ')),
        ),
        createElementColumn<Project, number, ProjectActionsProps>(
            'actions',
            '',
            ProjectActions,
            (_, project) => ({
                onProjectDeletionSuccess: reTriggerProjectListRequest,
                className: styles.actions,
                project,
            }),
        ),
    ]), [
        reTriggerProjectListRequest,
        strings.nSTableCountries,
        strings.nSTableProjectName,
        strings.nSTableSector,
        strings.nSTableTotalBudget,
        strings.nSTableDisasterType,
        strings.nSTablePeopleTargeted,
        strings.nSTablePeopleReached,
        strings.nSContactPerson,
        strings.nSStartDate,
    ]);

    const countryIdList = Object.keys(countryGroupedProjects) as unknown as number[];

    const [
        pendingExport,
        progress,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        onFailure: () => {
            alert.show(
                strings.nSFailedToCreateExport,
                { variant: 'danger' },
            );
        },
        onSuccess: (data) => {
            const unparseData = unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, `${countryResponse?.society_name}-international-works.csv`);
        },
    });

    const handleExportClick = useCallback(() => {
        if (!projectListResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/project/',
            projectListResponse?.count,
            {
                reporting_ns: isDefined(countryResponse) ? [countryResponse.id] : undefined,
            },
        );
    }, [
        countryResponse,
        triggerExportStart,
        projectListResponse?.count,
    ]);

    const activityAndTargetedPopulationCard = countryCountWithNSProjects > 0
        || targetedPopulation > 0;
    const totalProjectsAndProgrammeTypeCard = filteredProjectList.length > 0
        || programmeTypeStats.length > 0;
    const fundingRequirementsAndProjectStatusCard = ongoingProjectBudget > 0
        || projectStatusTypeStats.length > 0;

    const showCardsSection = activityAndTargetedPopulationCard
        || totalProjectsAndProgrammeTypeCard
        || fundingRequirementsAndProjectStatusCard;

    const projectsByCountry = useMemo(() => (
        countryIdList.map((countryId) => {
            const projectsInCountry = countryGroupedProjects[countryId];

            if (isNotDefined(projectsInCountry) || projectsInCountry.length === 0) {
                return null;
            }

            return {
                id: countryId,
                projects: projectsInCountry,
            };
        }).filter(isDefined)
    ), [countryGroupedProjects, countryIdList]);

    type ProjectsByCountry = typeof projectsByCountry;
    const countryListRendererParams = useCallback(
        (_: number, item: ProjectsByCountry[number]) => ({
            heading: resolveToString(
                strings.nSCountryProjects,
                {
                    countryName: item.projects[0].project_country_detail.name,
                    numProjects: item.projects.length,
                },
            ),
            headingLevel: 5 as const,
            childrenContainerClassName: styles.projectsInCountry,
            // FIXME: use separate component for this
            children: item.projects.map((project) => (
                <div
                    key={project.id}
                    className={styles.projectInCountryItem}
                >
                    <div className={styles.name}>
                        {project.name}
                    </div>
                    <ProjectActions
                        project={project}
                        className={styles.action}
                        onProjectDeletionSuccess={
                            reTriggerProjectListRequest
                        }
                    />
                </div>
            )),
        }),
        [strings.nSCountryProjects, reTriggerProjectListRequest],
    );

    return (
        <Container
            className={styles.nsActivity}
            actions={(
                <Link
                    to="newThreeWActivity"
                    variant="secondary"
                    icons={<AddFillIcon />}
                >
                    {strings.addNSActivity}
                </Link>
            )}
            headerDescription={strings.nSActivityDescription}
            withCenteredHeaderDescription
            pending={projectListPending}
            contentViewType="vertical"
            spacing="loose"
        >
            <Container
                className={styles.ongoingProjects}
                childrenContainerClassName={styles.content}
                heading={resolveToString(
                    strings.nsActivitiesTitle,
                    { count: ongoingProjects.length },
                )}
                withHeaderBorder
                filters={(
                    <Filter
                        value={rawFilter}
                        onChange={setFilterField}
                    />
                )}
                actions={(
                    <>
                        <ExportButton
                            onClick={handleExportClick}
                            progress={progress}
                            pendingExport={pendingExport}
                            totalCount={projectListResponse?.count}
                        />
                        <Link
                            to="allThreeWProject"
                            urlSearch={`reporting_ns=${countryResponse?.id}`}
                            withLinkIcon
                        >
                            {strings.nSAllProjects}
                        </Link>
                    </>
                )}
            >
                {showCardsSection && (
                    <div className={styles.keyFigureCardList}>
                        {activityAndTargetedPopulationCard && (
                            <div className={styles.keyFigureCard}>
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={countryCountWithNSProjects}
                                    label={strings.countriesNSWork}
                                    labelClassName={styles.keyFigureDescription}
                                />
                                <div className={styles.separator} />
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={targetedPopulation}
                                    label={strings.nSTargetedPopulationTitle}
                                    labelClassName={styles.keyFigureDescription}
                                    compactValue
                                />
                            </div>
                        )}
                        {totalProjectsAndProgrammeTypeCard && (
                            <div className={styles.keyFigureCard}>
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={filteredProjectList.length}
                                    label={strings.nSTotalProjectsTitle}
                                    labelClassName={styles.keyFigureDescription}
                                />
                                <div className={styles.separator} />
                                <Container
                                    heading={strings.nSProgrammeType}
                                    headingLevel={5}
                                    className={styles.pieChartContainer}
                                >
                                    <PieChart
                                        className={styles.pieChart}
                                        data={programmeTypeStats}
                                        valueSelector={numericValueSelector}
                                        labelSelector={stringLabelSelector}
                                        keySelector={stringLabelSelector}
                                        colors={primaryRedColorShades}
                                        pieRadius={40}
                                        chartPadding={10}
                                    />
                                </Container>
                            </div>
                        )}
                        {fundingRequirementsAndProjectStatusCard && (
                            <div className={styles.keyFigureCard}>
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={ongoingProjectBudget}
                                    label={strings.nSFundingRequirementsTitle}
                                    labelClassName={styles.keyFigureDescription}
                                    compactValue
                                />
                                <div className={styles.separator} />
                                <Container
                                    heading={strings.nSProjectStatus}
                                    headingLevel={5}
                                    className={styles.pieChartContainer}
                                >
                                    <PieChart
                                        className={styles.pieChart}
                                        data={projectStatusTypeStats}
                                        valueSelector={numericValueSelector}
                                        labelSelector={stringLabelSelector}
                                        keySelector={stringLabelSelector}
                                        colors={primaryRedColorShades}
                                        pieRadius={40}
                                        chartPadding={10}
                                    />
                                </Container>
                            </div>
                        )}
                    </div>
                )}
                <Map
                    projectList={ongoingProjects}
                    sidebarContent={(
                        <Container
                            className={styles.sidebar}
                            heading={strings.nSProjectByCountryTitle}
                            withInternalPadding
                            childrenContainerClassName={styles.sidebarContent}
                        >
                            <List
                                filtered={filtered}
                                pending={projectListPending || countryResponsePending}
                                errored={false}
                                data={projectsByCountry}
                                renderer={ExpandableContainer}
                                keySelector={numericIdSelector}
                                rendererParams={countryListRendererParams}
                            />
                        </Container>
                    )}
                />
                <Table
                    className={styles.internationalWorksTable}
                    filtered={filtered}
                    pending={projectListPending || countryResponsePending}
                    data={ongoingProjects}
                    columns={tableColumns}
                    keySelector={numericIdSelector}
                />
            </Container>
            <NationalSocietyDirectoryInitiatives />
        </Container>
    );
}

Component.displayName = 'CountryNsOverviewActivities';
